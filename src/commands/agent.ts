import { spawn as spawnProcess } from "node:child_process";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import color from "picocolors";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

// Helper to check if process with PID is running
function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (_e) {
    return false;
  }
}

type UserPreferences = {
  default_cli?: string;
  agent_cli_mapping?: Record<string, string>;
};

type VendorConfig = {
  command?: string;
  subcommand?: string;
  prompt_flag?: string;
  auto_approve_flag?: string;
  output_format_flag?: string;
  output_format?: string;
  model_flag?: string;
  default_model?: string;
  isolation_env?: string;
  isolation_flags?: string;
};

type CliConfig = {
  active_vendor?: string;
  vendors: Record<string, VendorConfig>;
};

function splitArgs(value: string): string[] {
  const args: string[] = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match: RegExpExecArray | null = regex.exec(value);
  while (match !== null) {
    if (match[1] !== undefined) args.push(match[1]);
    else if (match[2] !== undefined) args.push(match[2]);
    else if (match[0]) args.push(match[0]);
    match = regex.exec(value);
  }
  return args;
}

const UserPreferencesSchema = z
  .object({
    default_cli: z.string().optional(),
    agent_cli_mapping: z.record(z.string()).optional(),
  })
  .passthrough()
  .transform((value) => ({
    default_cli: value.default_cli,
    agent_cli_mapping: value.agent_cli_mapping ?? {},
  }));

const VendorConfigSchema = z
  .object({
    command: z.string().optional(),
    subcommand: z.string().optional(),
    prompt_flag: z
      .string()
      .optional()
      .transform((value) => {
        if (value === undefined) return undefined;
        const normalized = value.trim().toLowerCase();
        if (
          normalized === "" ||
          normalized === "none" ||
          normalized === "null"
        ) {
          return null;
        }
        return value;
      }),
    auto_approve_flag: z.string().optional(),
    output_format_flag: z.string().optional(),
    output_format: z.string().optional(),
    model_flag: z.string().optional(),
    default_model: z.string().optional(),
    isolation_env: z.string().optional(),
    isolation_flags: z.string().optional(),
  })
  .passthrough()
  .transform((value) => ({
    ...value,
    prompt_flag: value.prompt_flag ?? undefined,
  }));

const CliConfigSchema = z
  .object({
    active_vendor: z.string().optional(),
    vendors: z.record(VendorConfigSchema).optional(),
  })
  .passthrough()
  .transform((value) => ({
    active_vendor: value.active_vendor,
    vendors: value.vendors ?? {},
  }));

function parseYamlValue(content: string): unknown {
  try {
    return parseYaml(content);
  } catch {
    return null;
  }
}

function parseUserPreferences(content: string): UserPreferences {
  const parsed = parseYamlValue(content);
  const result = UserPreferencesSchema.safeParse(parsed);
  if (!result.success) return {};
  return result.data;
}

function parseCliConfig(content: string): CliConfig {
  const parsed = parseYamlValue(content);
  const result = CliConfigSchema.safeParse(parsed);
  if (!result.success) return { vendors: {} };

  const vendors: Record<string, VendorConfig> = {};
  for (const [vendor, cfg] of Object.entries(result.data.vendors)) {
    vendors[vendor] = { ...cfg };
  }

  return result.data;
}

function readUserPreferences(cwd: string): UserPreferences | null {
  const configPath = path.join(
    cwd,
    ".agent",
    "config",
    "user-preferences.yaml",
  );
  if (!fs.existsSync(configPath)) return null;
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    return parseUserPreferences(content);
  } catch {
    return null;
  }
}

function readCliConfig(cwd: string): CliConfig | null {
  const configPath = path.join(
    cwd,
    ".agent",
    "skills",
    "orchestrator",
    "config",
    "cli-config.yaml",
  );
  if (!fs.existsSync(configPath)) return null;
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    return parseCliConfig(content);
  } catch {
    return null;
  }
}

function resolveVendor(
  agentId: string,
  vendorOverride?: string,
): { vendor: string; config: CliConfig | null } {
  const cwd = process.cwd();
  const userPrefs = readUserPreferences(cwd);
  const cliConfig = readCliConfig(cwd);

  const normalizedAgentId = agentId.replace(/-agent$/i, "");
  const mappedVendor =
    userPrefs?.agent_cli_mapping?.[agentId] ||
    userPrefs?.agent_cli_mapping?.[normalizedAgentId];
  const vendor =
    vendorOverride ||
    mappedVendor ||
    userPrefs?.default_cli ||
    cliConfig?.active_vendor ||
    "gemini";

  return { vendor: vendor.toLowerCase(), config: cliConfig };
}

function resolvePromptFlag(
  vendor: string,
  promptFlag?: string | null,
): string | null {
  if (promptFlag !== undefined) {
    return promptFlag;
  }

  const defaults: Record<string, string | null> = {
    gemini: "-p",
    claude: "-p",
    qwen: "-p",
    codex: null,
  };

  return defaults[vendor] ?? "-p";
}

export async function spawnAgent(
  agentId: string,
  promptFile: string,
  sessionId: string,
  workspace: string,
  vendorOverride?: string,
) {
  const resolvedPromptFile = path.resolve(promptFile);
  const resolvedWorkspace = path.resolve(workspace);

  if (!fs.existsSync(resolvedPromptFile)) {
    console.error(
      color.red(`ERROR: Prompt file not found: ${resolvedPromptFile}`),
    );
    process.exit(1);
  }

  if (!fs.existsSync(resolvedWorkspace)) {
    console.error(
      color.red(`ERROR: Workspace directory not found: ${resolvedWorkspace}`),
    );
    process.exit(1);
  }

  const tmpDir = tmpdir();
  const logFile = path.join(tmpDir, `subagent-${sessionId}-${agentId}.log`);
  const pidFile = path.join(tmpDir, `subagent-${sessionId}-${agentId}.pid`);

  // Read prompt content
  const promptContent = fs.readFileSync(resolvedPromptFile, "utf-8");

  const { vendor, config } = resolveVendor(agentId, vendorOverride);
  const vendorConfig = config?.vendors?.[vendor] || {};
  const command = vendorConfig.command || vendor;
  const subcommand = vendorConfig.subcommand;

  // Prepare log stream
  const logStream = fs.openSync(logFile, "w");

  console.log(color.blue(`[${agentId}] Spawning subagent...`));
  console.log(color.dim(`  Vendor: ${vendor}`));
  console.log(color.dim(`  Workspace: ${resolvedWorkspace}`));
  console.log(color.dim(`  Log: ${logFile}`));

  const optionArgs: string[] = [];
  const promptFlag = resolvePromptFlag(vendor, vendorConfig.prompt_flag);

  if (vendorConfig.output_format_flag && vendorConfig.output_format) {
    optionArgs.push(
      vendorConfig.output_format_flag,
      vendorConfig.output_format,
    );
  } else if (vendorConfig.output_format_flag) {
    optionArgs.push(vendorConfig.output_format_flag);
  }

  if (vendorConfig.model_flag && vendorConfig.default_model) {
    optionArgs.push(vendorConfig.model_flag, vendorConfig.default_model);
  }

  if (vendorConfig.isolation_flags) {
    optionArgs.push(...splitArgs(vendorConfig.isolation_flags));
  }

  if (vendorConfig.auto_approve_flag) {
    optionArgs.push(vendorConfig.auto_approve_flag);
  } else {
    const defaultAutoApprove: Record<string, string> = {
      gemini: "--approval-mode=yolo",
      codex: "--full-auto",
      qwen: "--yolo",
    };
    const fallbackFlag = defaultAutoApprove[vendor];
    if (fallbackFlag) {
      optionArgs.push(fallbackFlag);
    }
  }

  if (promptFlag) {
    optionArgs.push(promptFlag, promptContent);
  }

  const args: string[] = [];
  if (subcommand) args.push(subcommand);
  args.push(...optionArgs);
  if (!promptFlag) {
    args.push(promptContent);
  }

  const env = { ...process.env };
  if (vendorConfig.isolation_env) {
    const [key, ...rest] = vendorConfig.isolation_env.split("=");
    const rawValue = rest.join("=");
    if (key && rawValue) {
      env[key] = rawValue.replace("$$", String(process.pid));
    }
  }

  // Spawn selected CLI
  const child = spawnProcess(command, args, {
    cwd: resolvedWorkspace,
    stdio: ["ignore", logStream, logStream], // Redirect stdout/stderr to log file
    detached: false, // We want to wait for it, behaving like the script
    env,
  });

  if (!child.pid) {
    console.error(color.red(`[${agentId}] Failed to spawn process`));
    process.exit(1);
  }

  // Write PID
  fs.writeFileSync(pidFile, child.pid.toString());
  console.log(color.green(`[${agentId}] Started with PID ${child.pid}`));

  const cleanup = () => {
    try {
      if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
      if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    } catch (_e) {
      // ignore
    }
  };

  // Handle signals to kill child
  const cleanAndExit = () => {
    if (child.pid && isProcessRunning(child.pid)) {
      process.kill(child.pid);
    }
    cleanup();
    process.exit();
  };

  process.on("SIGINT", cleanAndExit);
  process.on("SIGTERM", cleanAndExit);

  child.on("exit", (code) => {
    console.log(color.blue(`[${agentId}] Exited with code ${code}`));
    cleanup();
    process.exit(code ?? 0);
  });
}

export async function checkStatus(
  sessionId: string,
  agentIds: string[],
  rootPath: string = process.cwd(),
) {
  const results: Record<string, string> = {};

  for (const agent of agentIds) {
    const resultFile = path.join(
      rootPath,
      ".serena",
      "memories",
      `result-${agent}.md`,
    );
    const pidFile = path.join(tmpdir(), `subagent-${sessionId}-${agent}.pid`);

    if (fs.existsSync(resultFile)) {
      const content = fs.readFileSync(resultFile, "utf-8");
      // grep "^## Status:" "$RESULT" | head -1 | awk '{print $3}'
      const match = content.match(/^## Status:\s*(\S+)/m);
      if (match?.[1]) {
        // Use the status from the file to be more precise if possible
        // But script logic was:
        // STATUS=$(grep "^## Status:" "$RESULT" | head -1 | awk '{print $3}')
        // echo "${agent}:${STATUS}"
        results[agent] = match[1];
      } else {
        results[agent] = `completed`; // Fallback if status header missing but file exists
      }
    } else if (fs.existsSync(pidFile)) {
      // Logic for checking PID
      const pidContent = fs.readFileSync(pidFile, "utf-8").trim();
      const pid = parseInt(pidContent, 10);
      if (!Number.isNaN(pid) && isProcessRunning(pid)) {
        results[agent] = "running";
      } else {
        results[agent] = "crashed";
      }
    } else {
      results[agent] = "crashed"; // or "not_started" but script says "crashed"
    }
  }

  // Output in format comparable to script: "agent:status"
  for (const [agent, status] of Object.entries(results)) {
    console.log(`${agent}:${status}`);
  }
}
