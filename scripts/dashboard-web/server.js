#!/usr/bin/env node
/**
 * Serena Memory Web Dashboard Server
 *
 * Watches .serena/memories/ for file changes using chokidar,
 * then pushes updates to connected browsers via WebSocket.
 *
 * Usage:
 *   node scripts/dashboard-web/server.js
 *   → http://localhost:9847
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

let chokidar;
let WebSocketServer;

try {
  chokidar = require("chokidar");
} catch {
  console.error(
    "Missing dependency: chokidar\nRun: npm install chokidar ws"
  );
  process.exit(1);
}

try {
  ({ WebSocketServer } = require("ws"));
} catch {
  console.error("Missing dependency: ws\nRun: npm install chokidar ws");
  process.exit(1);
}

const PORT = 9847;
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const MEMORIES_DIR = path.join(PROJECT_ROOT, ".serena", "memories");
const PUBLIC_DIR = path.join(__dirname, "public");

// Ensure memories dir exists
if (!fs.existsSync(MEMORIES_DIR)) {
  fs.mkdirSync(MEMORIES_DIR, { recursive: true });
}

// --- File parsing helpers ---

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function parseSessionInfo() {
  const content = readFileSafe(path.join(MEMORIES_DIR, "orchestrator-session.md"));
  if (!content) return { id: "N/A", status: "UNKNOWN" };

  let id =
    (content.match(/session-id:\s*(.+)/i) || [])[1] ||
    (content.match(/(session-\d{8}-\d{6})/)?.[1]) ||
    "N/A";

  let status = "UNKNOWN";
  if (/status:.*running|phase:.*executing|## Active/i.test(content)) {
    status = "RUNNING";
  } else if (/status:.*completed|phase:.*completed|## Completed/i.test(content)) {
    status = "COMPLETED";
  } else if (/status:.*failed|phase:.*failed/i.test(content)) {
    status = "FAILED";
  }

  return { id: id.trim(), status };
}

function parseTaskBoard() {
  const content = readFileSafe(path.join(MEMORIES_DIR, "task-board.md"));
  if (!content) return [];

  const agents = [];
  const lines = content.split("\n");
  for (const line of lines) {
    if (!line.startsWith("|") || /^\|\s*-+/.test(line)) continue;
    const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cols.length < 2) continue;
    // Skip header
    if (/^agent$/i.test(cols[0])) continue;

    agents.push({
      agent: cols[0] || "",
      status: cols[1] || "pending",
      task: cols[2] || "",
    });
  }
  return agents;
}

function getAgentTurn(agent) {
  try {
    const files = fs.readdirSync(MEMORIES_DIR)
      .filter((f) => f.startsWith(`progress-${agent}`) && f.endsWith(".md"))
      .sort()
      .reverse();
    if (files.length === 0) return null;
    const content = readFileSafe(path.join(MEMORIES_DIR, files[0]));
    const match = content.match(/turn[:\s]*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  } catch {
    return null;
  }
}

function getLatestActivity() {
  try {
    const files = fs.readdirSync(MEMORIES_DIR)
      .filter((f) => f.startsWith("progress-") || f.startsWith("result-"))
      .map((f) => ({
        name: f,
        mtime: fs.statSync(path.join(MEMORIES_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 5);

    return files.map((f) => {
      const agent = f.name.replace(/^(progress|result)-/, "").replace(/\.md$/, "");
      const content = readFileSafe(path.join(MEMORIES_DIR, f.name));
      const lines = content.split("\n").filter((l) => /^[\*\-#]|turn|status|result/i.test(l.trim()));
      const last = lines[lines.length - 1] || "";
      return { agent, message: last.replace(/^[#*\- ]+/, "").trim() };
    }).filter((a) => a.message);
  } catch {
    return [];
  }
}

function buildFullState() {
  const session = parseSessionInfo();
  const taskBoard = parseTaskBoard();

  // Enrich with turn info
  const agents = taskBoard.map((a) => ({
    ...a,
    turn: getAgentTurn(a.agent),
  }));

  // If no task board, try to discover from progress files
  if (agents.length === 0) {
    try {
      const progressFiles = fs.readdirSync(MEMORIES_DIR)
        .filter((f) => f.startsWith("progress-") && f.endsWith(".md"));
      for (const f of progressFiles) {
        const agent = f.replace(/^progress-/, "").replace(/\.md$/, "");
        agents.push({
          agent,
          status: "running",
          task: "",
          turn: getAgentTurn(agent),
        });
      }
    } catch {
      // ignore
    }
  }

  const activity = getLatestActivity();

  return { session, agents, activity, updatedAt: new Date().toISOString() };
}

// --- HTTP server ---

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const httpServer = http.createServer((req, res) => {
  // API endpoint for current state
  if (req.url === "/api/state") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(buildFullState()));
    return;
  }

  // Serve static files
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(PUBLIC_DIR, filePath);

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

// --- WebSocket server ---

const wss = new WebSocketServer({ server: httpServer });

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(msg);
    }
  }
}

wss.on("connection", (ws) => {
  // Send full state on connect
  ws.send(JSON.stringify({ type: "full", data: buildFullState() }));

  // Clean up dead connections
  ws.on("error", () => {
    ws.terminate();
  });
});

// --- File watcher ---

let debounceTimer = null;

const watcher = chokidar.watch(MEMORIES_DIR, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
});

watcher.on("all", (event, filePath) => {
  // Debounce: collapse rapid changes into one update
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const state = buildFullState();
    broadcast({
      type: "update",
      event,
      file: path.basename(filePath),
      data: state,
    });
  }, 100);
});

// --- Graceful shutdown ---

function shutdown() {
  console.log("\nShutting down...");

  // Close file watcher
  watcher.close().then(() => {
    console.log("  File watcher closed");
  }).catch(() => {});

  // Close all WebSocket connections
  for (const client of wss.clients) {
    client.terminate();
  }

  // Close WebSocket server
  wss.close(() => {
    console.log("  WebSocket server closed");

    // Close HTTP server
    httpServer.close(() => {
      console.log("  HTTP server closed");
      process.exit(0);
    });
  });

  // Force exit after 3 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error("  Forced exit after timeout");
    process.exit(1);
  }, 3000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// --- Start ---

httpServer.listen(PORT, () => {
  console.log(`Serena Memory Dashboard`);
  console.log(`  Web UI:  http://localhost:${PORT}`);
  console.log(`  Watching: ${MEMORIES_DIR}`);
  console.log(`  Press Ctrl+C to stop`);
});
