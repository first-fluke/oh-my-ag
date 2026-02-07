import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import http, { type IncomingMessage } from "node:http";
import https from "node:https";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_SSE_URL = "http://localhost:12341/sse";
const STARTUP_CHECK_INTERVAL_MS = 1000;
const STARTUP_PROBE_TIMEOUT_MS = Number.parseInt(
  process.env.OH_MY_AG_BRIDGE_PROBE_TIMEOUT_MS ?? "2000",
  10,
);
const STARTUP_TIMEOUT_MS = Number.parseInt(
  process.env.OH_MY_AG_BRIDGE_STARTUP_TIMEOUT_MS ?? "120000",
  10,
);

export function validateSerenaConfigs(): void {
  const globalConfigPath = join(homedir(), ".serena", "serena_config.yml");

  if (!existsSync(globalConfigPath)) {
    return;
  }

  try {
    const globalContent = readFileSync(globalConfigPath, "utf8");

    // Extract projects list from global config
    const projectsMatch = globalContent.match(
      /^projects:\s*\n((?:\s*-\s*.+\n?)*)/m,
    );
    if (!projectsMatch) {
      return;
    }

    const projectLines =
      (projectsMatch[1] ?? "").match(/^\s*-\s*(.+)$/gm) || [];
    const projects = projectLines.map((line) =>
      line.replace(/^\s*-\s*/, "").trim(),
    );

    // Check each project's config
    for (const projectPath of projects) {
      const projectConfigPath = join(projectPath, ".serena", "project.yml");

      if (!existsSync(projectConfigPath)) {
        continue;
      }

      const content = readFileSync(projectConfigPath, "utf8");

      // Check if languages key exists at root level
      if (!/^languages:/m.test(content)) {
        console.error(
          `[Bridge] Missing 'languages' key in ${projectConfigPath}, adding default...`,
        );

        // Find insertion point after project: block
        const insertIndex = content.search(/\n(?=\w)/);
        if (insertIndex !== -1) {
          const newContent = `${content.slice(0, insertIndex)}\n\nlanguages:\n  - python\n  - typescript\n  - dart\n  - terraform${content.slice(insertIndex)}`;
          writeFileSync(projectConfigPath, newContent);
          console.error(`[Bridge] Fixed ${projectConfigPath}`);
        }
      }
    }
  } catch (err) {
    console.error(
      `[Bridge] Warning: Failed to validate Serena configs: ${err instanceof Error ? err.message : err}`,
    );
  }
}

export async function bridge(sseUrlArg?: string) {
  const SSE_URL = sseUrlArg || DEFAULT_SSE_URL;
  const MCP_ENDPOINT = SSE_URL.replace("/sse", "/mcp");

  // Parse SSE URL
  const url = new URL(SSE_URL);
  const isHttps = url.protocol === "https:";
  const httpModule = isHttps ? https : http;

  let serenaProcess: ChildProcess | null = null;
  let isShuttingDown = false;

  async function checkServer(): Promise<boolean> {
    const probeTargets =
      url.hostname === "localhost"
        ? [SSE_URL, SSE_URL.replace("localhost", "127.0.0.1")]
        : [SSE_URL];

    for (const target of probeTargets) {
      const isReachable = await new Promise<boolean>((resolve) => {
        const req = httpModule.get(target, (_res) => {
          // If we get any response (even 404), the server is up
          resolve(true);
          req.destroy();
        });

        req.setTimeout(STARTUP_PROBE_TIMEOUT_MS, () => {
          req.destroy();
          resolve(false);
        });

        req.on("error", () => {
          resolve(false);
        });

        req.end();
      });

      if (isReachable) {
        return true;
      }
    }

    return false;
  }

  async function startServer(): Promise<void> {
    const port = url.port || "12341";
    const host = url.hostname || "0.0.0.0";

    console.error(`Starting Serena server on ${host}:${port}...`);

    // Spawn Serena using uvx
    const args = [
      "--from",
      "git+https://github.com/oraios/serena",
      "serena-mcp-server",
      "--transport",
      "sse",
      "--host",
      host,
      "--port",
      port,
      "--context",
      "ide",
      "--open-web-dashboard",
      "false",
    ];

    serenaProcess = spawn("uvx", args, {
      stdio: "pipe", // Pipe stdio so we don't pollute the bridge's stdout
      detached: false,
    });

    if (serenaProcess.stderr) {
      serenaProcess.stderr.on("data", (data) => {
        // Forward stderr to our stderr so user can see startup logs/errors
        process.stderr.write(`[Serena] ${data}`);
      });
    }

    if (serenaProcess.stdout) {
      serenaProcess.stdout.on("data", () => {
        // Drain stdout to avoid child process blocking on a full pipe buffer.
      });
    }

    serenaProcess.on("error", (err) => {
      console.error("Failed to start Serena server:", err);
      process.exit(1);
    });

    serenaProcess.on("exit", (code, signal) => {
      console.error(`Serena server exited with code ${code} signal ${signal}`);
      if (!isShuttingDown) {
        process.exit(code || 1);
      }
    });

    // Wait for server to be ready
    console.error("Waiting for Serena to be ready...");
    const maxAttempts = Math.max(
      1,
      Math.ceil(STARTUP_TIMEOUT_MS / STARTUP_CHECK_INTERVAL_MS),
    );
    for (let i = 0; i < maxAttempts; i++) {
      if (await checkServer()) {
        console.error("Serena server is ready!");
        return;
      }
      await new Promise((r) => setTimeout(r, STARTUP_CHECK_INTERVAL_MS));
    }

    console.error("Timed out waiting for Serena server to start.");
    process.exit(1);
  }

  // Validate Serena configs before starting
  validateSerenaConfigs();

  // Check if server is running
  const isRunning = await checkServer();
  if (!isRunning) {
    await startServer();
  } else {
    console.error(`Connected to existing Serena server at ${SSE_URL}`);
  }

  // Connect to SSE stream for server-to-client messages
  function connectSSE() {
    const options = {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
    };

    const req = httpModule.request(SSE_URL, options, (res: IncomingMessage) => {
      if (res.statusCode !== 200) {
        console.error(`SSE connection failed: ${res.statusCode}`);
        return;
      }

      let buffer = "";

      res.on("data", (chunk: string | Buffer) => {
        buffer += chunk.toString();

        // Parse SSE events
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventType = "message";
        let eventData = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            eventData = line.slice(5).trim();
          } else if (line === "" && eventData) {
            // End of event
            handleSSEEvent(eventType, eventData);
            eventType = "message";
            eventData = "";
          }
        }
      });

      res.on("end", () => {
        console.error("SSE connection closed, reconnecting...");
        setTimeout(connectSSE, 1000);
      });

      res.on("error", (err: Error) => {
        console.error("SSE error:", err.message);
        setTimeout(connectSSE, 1000);
      });
    });

    req.on("error", (err: Error) => {
      console.error("SSE connection error:", err.message);
      setTimeout(connectSSE, 1000);
    });

    req.end();
  }

  function handleSSEEvent(eventType: string, data: string) {
    try {
      if (eventType === "message" || eventType === "endpoint") {
        // Ignore endpoint messages
        return;
      }

      const parsed = JSON.parse(data);

      // Forward to stdout (IDE)
      process.stdout.write(`${JSON.stringify(parsed)}\n`);
    } catch (_err) {
      // Not JSON, might be keepalive or other message
    }
  }

  // Handle stdin (messages from IDE)
  let stdinBuffer = "";

  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    stdinBuffer += chunk.toString();

    // Process complete lines
    const lines = stdinBuffer.split("\n");
    stdinBuffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) {
        handleIDEMessage(line.trim());
      }
    }
  });

  function handleIDEMessage(message: string) {
    try {
      const parsed = JSON.parse(message);

      // Send to Serena MCP endpoint
      const postData = JSON.stringify(parsed);

      const mcpUrl = new URL(MCP_ENDPOINT);

      const options = {
        hostname: mcpUrl.hostname,
        port: mcpUrl.port,
        path: mcpUrl.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      const req = httpModule.request(options, (res: IncomingMessage) => {
        let responseData = "";

        res.on("data", (chunk: string | Buffer) => {
          responseData += chunk.toString();
        });

        res.on("end", () => {
          if (responseData.trim()) {
            // Forward response to IDE
            process.stdout.write(`${responseData}\n`);
          }
        });
      });

      req.on("error", (err: Error) => {
        // Send error response back to IDE
        const errorResponse = {
          jsonrpc: "2.0",
          id: parsed.id,
          error: {
            code: -32603,
            message: `Bridge error: ${err.message}`,
          },
        };
        process.stdout.write(`${JSON.stringify(errorResponse)}\n`);
      });

      req.write(postData);
      req.end();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Failed to parse IDE message:", errorMessage);
    }
  }

  // Start SSE connection
  connectSSE();

  // Keep process alive
  process.stdin.resume();

  // Handle graceful shutdown
  const cleanup = () => {
    isShuttingDown = true;
    if (serenaProcess) {
      console.error("Stopping Serena server...");
      serenaProcess.kill("SIGTERM");
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}
