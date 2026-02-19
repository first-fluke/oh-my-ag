import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { createServer } from "node:http";
import { basename, join } from "node:path";
import { watch } from "chokidar";
import * as pc from "picocolors";
import { WebSocket, WebSocketServer } from "ws";

const PORT = process.env.DASHBOARD_PORT
  ? parseInt(process.env.DASHBOARD_PORT || "9847", 10)
  : 9847;

function resolveMemoriesDir(): string {
  if (process.env.MEMORIES_DIR) return process.env.MEMORIES_DIR;
  const cliArg = process.argv[3];
  if (cliArg) return join(cliArg, ".serena", "memories");
  return join(process.cwd(), ".serena", "memories");
}

function readFileSafe(filePath: string): string {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function findSessionFile(memoriesDir: string): string | null {
  try {
    const files = readdirSync(memoriesDir);
    if (files.includes("orchestrator-session.md")) {
      return join(memoriesDir, "orchestrator-session.md");
    }
    const sessionFiles = files
      .filter((f) => /^session-.*\.md$/.test(f))
      .map((f) => ({ name: f, mtime: statSync(join(memoriesDir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    if (sessionFiles.length > 0 && sessionFiles[0]) {
      return join(memoriesDir, sessionFiles[0].name);
    }
  } catch {}
  return null;
}

function parseSessionInfo(memoriesDir: string) {
  const sessionFile = findSessionFile(memoriesDir);
  if (!sessionFile) return { id: "N/A", status: "UNKNOWN" };

  const content = readFileSafe(sessionFile);
  if (!content) return { id: "N/A", status: "UNKNOWN" };

  const id =
    (content.match(/session-id:\s*(.+)/i) || [])[1] ||
    (content.match(/# Session:\s*(.+)/i) || [])[1] ||
    content.match(/(session-\d{8}-\d{6})/)?.[1] ||
    basename(sessionFile, ".md") ||
    "N/A";

  let status = "UNKNOWN";
  if (/IN PROGRESS|RUNNING|## Active|\[IN PROGRESS\]/i.test(content)) {
    status = "RUNNING";
  } else if (/COMPLETED|DONE|## Completed|\[COMPLETED\]/i.test(content)) {
    status = "COMPLETED";
  } else if (/FAILED|ERROR|## Failed|\[FAILED\]/i.test(content)) {
    status = "FAILED";
  } else if (/Step \d+:.*\[/i.test(content)) {
    status = "RUNNING";
  }

  return { id: id.trim(), status };
}

function parseTaskBoard(memoriesDir: string) {
  const content = readFileSafe(join(memoriesDir, "task-board.md"));
  if (!content) return [];

  const agents: { agent: string; status: string; task: string }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    if (!line.startsWith("|") || /^\|\s*-+/.test(line)) continue;
    const cols = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    const agentName = cols[0];
    if (cols.length < 2 || !agentName || /^agent$/i.test(agentName)) continue;
    agents.push({
      agent: cols[0] || "",
      status: cols[1] || "pending",
      task: cols[2] || "",
    });
  }
  return agents;
}

function getAgentTurn(memoriesDir: string, agent: string): number | null {
  try {
    const files = readdirSync(memoriesDir)
      .filter((f) => f.startsWith(`progress-${agent}`) && f.endsWith(".md"))
      .sort()
      .reverse();
    if (files.length === 0) return null;
    const content = files[0] ? readFileSafe(join(memoriesDir, files[0])) : "";
    const match = content.match(/turn[:\s]*(\d+)/i);
    return match?.[1] ? parseInt(match[1], 10) : null;
  } catch {
    return null;
  }
}

function getLatestActivity(memoriesDir: string) {
  try {
    const files = readdirSync(memoriesDir)
      .filter((f) => f.endsWith(".md") && f !== ".gitkeep")
      .map((f) => ({ name: f, mtime: statSync(join(memoriesDir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 5);

    return files
      .map((f) => {
        const name =
          f.name
            .replace(/^(progress|result|session|debug|task)-?/, "")
            .replace(/[-_]agent/, "")
            .replace(/[-_]completion/, "")
            .replace(/\.md$/, "")
            .replace(/[-_]/g, " ")
            .trim() || f.name.replace(/\.md$/, "");

        const content = readFileSafe(join(memoriesDir, f.name));
        const lines = content
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("---") && l.length > 3);

        let message = "";
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i];
          if (!line) continue;
          if (/^\*\*|^#+|^-|^\d+\.|Status|Result|Action|Step/i.test(line)) {
            message = line
              .replace(/^[#*\-\d.]+\s*/, "")
              .replace(/\*\*/g, "")
              .trim();
            if (message.length > 5) break;
          }
        }
        if (message.length > 80) message = `${message.substring(0, 77)}...`;
        return { agent: name, message, file: f.name };
      })
      .filter((a) => a.message);
  } catch {
    return [];
  }
}

function discoverAgentsFromFiles(memoriesDir: string) {
  const agents: {
    agent: string;
    status: string;
    task: string;
    turn: number | null;
  }[] = [];
  const seen = new Set<string>();

  try {
    const files = readdirSync(memoriesDir)
      .filter((f) => f.endsWith(".md") && f !== ".gitkeep")
      .map((f) => ({ name: f, mtime: statSync(join(memoriesDir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);

    for (const f of files) {
      const content = readFileSafe(join(memoriesDir, f.name));
      const agentMatch =
        content.match(/\*\*Agent\*\*:\s*(.+)/i) ||
        content.match(/Agent:\s*(.+)/i) ||
        content.match(/^#+\s*(.+?)\s*Agent/im);

      let agentName: string | null = null;
      if (agentMatch?.[1]) {
        agentName = agentMatch[1].trim();
      } else if (/_agent|agent_|-agent/i.test(f.name)) {
        agentName = f.name
          .replace(/\.md$/, "")
          .replace(/[-_]completion|[-_]progress|[-_]result/gi, "")
          .replace(/[-_]/g, " ")
          .trim();
      }

      if (agentName && !seen.has(agentName.toLowerCase())) {
        seen.add(agentName.toLowerCase());
        let status = "unknown";
        if (/\[COMPLETED\]|## Completed|## Results/i.test(content))
          status = "completed";
        else if (/\[IN PROGRESS\]|## Progress|IN PROGRESS/i.test(content))
          status = "running";
        else if (/\[FAILED\]|## Failed|ERROR/i.test(content)) status = "failed";

        const taskMatch =
          content.match(/## Task\s*\n+(.+)/i) ||
          content.match(/\*\*Task\*\*:\s*(.+)/i);
        const task = taskMatch?.[1] ? taskMatch[1].trim().substring(0, 60) : "";
        agents.push({
          agent: agentName,
          status,
          task,
          turn: getAgentTurn(memoriesDir, agentName),
        });
      }
    }
  } catch {}
  return agents;
}

function buildFullState(memoriesDir: string) {
  const session = parseSessionInfo(memoriesDir);
  const taskBoard = parseTaskBoard(memoriesDir);
  let agents = taskBoard.map((a) => ({
    ...a,
    turn: getAgentTurn(memoriesDir, a.agent),
  }));

  if (agents.length === 0) agents = discoverAgentsFromFiles(memoriesDir);
  if (agents.length === 0) {
    try {
      const progressFiles = readdirSync(memoriesDir).filter(
        (f) => f.startsWith("progress-") && f.endsWith(".md"),
      );
      for (const f of progressFiles) {
        const agent = f.replace(/^progress-/, "").replace(/\.md$/, "");
        agents.push({
          agent,
          status: "running",
          task: "",
          turn: getAgentTurn(memoriesDir, agent),
        });
      }
    } catch {}
  }

  return {
    session,
    agents,
    activity: getLatestActivity(memoriesDir),
    memoriesDir,
    updatedAt: new Date().toISOString(),
  };
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Serena Memory Dashboard</title>
  <style>
    :root { --bg:#0f0b1a;--surface:#1a1428;--surface-2:#241e33;--border:#3d2e5c;--purple:#9b59b6;--purple-light:#c39bd3;--purple-dark:#6c3483;--text:#e8e0f0;--text-dim:#8a7da0;--green:#2ecc71;--red:#e74c3c;--yellow:#f1c40f;--cyan:#1abc9c; }
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:var(--bg);color:var(--text);font-family:'SF Mono','Fira Code',monospace;min-height:100vh;padding:24px}
    .header{display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid var(--border)}
    .logo{width:48px;height:48px;background:linear-gradient(135deg,var(--purple),var(--purple-dark));border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:white}
    .header-text h1{font-size:20px;color:var(--purple-light)} .header-text .subtitle{font-size:12px;color:var(--text-dim)}
    .connection-badge{margin-left:auto;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:600}
    .connection-badge.connected{background:rgba(46,204,113,0.15);color:var(--green);border:1px solid rgba(46,204,113,0.3)}
    .connection-badge.disconnected{background:rgba(231,76,60,0.15);color:var(--red);border:1px solid rgba(231,76,60,0.3)}
    .connection-badge.connecting{background:rgba(241,196,15,0.15);color:var(--yellow);border:1px solid rgba(241,196,15,0.3)}
    .session-bar{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:20px}
    .session-id{font-size:14px;font-weight:600}
    .session-status{padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
    .session-status.running{background:rgba(46,204,113,0.15);color:var(--green)}
    .session-status.completed{background:rgba(26,188,156,0.15);color:var(--cyan)}
    .session-status.failed{background:rgba(231,76,60,0.15);color:var(--red)}
    .session-status.unknown{background:rgba(138,125,160,0.15);color:var(--text-dim)}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px} @media(max-width:900px){.grid{grid-template-columns:1fr}}
    .card{background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow:hidden}
    .card-header{padding:12px 16px;border-bottom:1px solid var(--border);font-size:13px;font-weight:600;color:var(--purple-light);background:var(--surface-2)}
    .card-body{padding:16px}
    .agent-table{width:100%;border-collapse:collapse;font-size:13px}
    .agent-table th{text-align:left;padding:8px 12px;color:var(--text-dim);font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--border)}
    .agent-table td{padding:10px 12px;border-bottom:1px solid rgba(61,46,92,0.4)} .agent-table tr:last-child td{border-bottom:none}
    .status-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
    .status-dot.running{background:var(--green);box-shadow:0 0 6px var(--green)} .status-dot.completed{background:var(--cyan)} .status-dot.failed{background:var(--red)} .status-dot.blocked{background:var(--yellow)} .status-dot.pending{background:var(--text-dim)}
    .activity-list{list-style:none;font-size:12px} .activity-list li{padding:8px 0;border-bottom:1px solid rgba(61,46,92,0.3);display:flex;gap:8px} .activity-list li:last-child{border-bottom:none}
    .activity-agent{color:var(--purple-light);font-weight:600;white-space:nowrap} .activity-msg{color:var(--text-dim)}
    .empty{color:var(--text-dim);font-size:12px;font-style:italic;padding:12px 0}
    .footer{margin-top:20px;padding-top:12px;border-top:1px solid var(--border);display:flex;justify-content:space-between;font-size:11px;color:var(--text-dim)}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} .pulse{animation:pulse 2s ease-in-out infinite}
  </style>
</head>
<body>
  <div class="header"><div class="logo">S</div><div class="header-text"><h1>Serena Memory Dashboard</h1><div class="subtitle">Real-time agent orchestration monitor</div></div><div class="connection-badge connecting" id="connBadge">Connecting...</div></div>
  <div class="session-bar"><span>Session:</span><span class="session-id" id="sessionId">N/A</span><span class="session-status unknown" id="sessionStatus">UNKNOWN</span><span style="margin-left:auto;font-size:11px;color:var(--text-dim)" id="updatedAt">--</span></div>
  <div class="grid"><div class="card"><div class="card-header">Agent Status</div><div class="card-body"><table class="agent-table"><thead><tr><th>Agent</th><th>Status</th><th>Turn</th><th>Task</th></tr></thead><tbody id="agentBody"><tr><td colspan="4" class="empty">No agents detected yet</td></tr></tbody></table></div></div><div class="card"><div class="card-header">Latest Activity</div><div class="card-body"><ul class="activity-list" id="activityList"><li class="empty">No activity yet</li></ul></div></div></div>
  <div class="footer"><span>Serena Memory Dashboard</span><span id="footerTime">--</span></div>
  <script>
    const $=s=>document.querySelector(s);
    function normalizeStatus(s){const l=(s||'').toLowerCase();if(['running','active','in_progress','in-progress'].includes(l))return'running';if(['completed','done','finished'].includes(l))return'completed';if(['failed','error'].includes(l))return'failed';if(['blocked','waiting'].includes(l))return'blocked';return'pending'}
    function clearChildren(el){while(el.firstChild)el.removeChild(el.firstChild)}
    function createTextEl(tag,text,cls){const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;return el}
    function renderAgents(agents){const tbody=$('#agentBody');clearChildren(tbody);if(!agents||!agents.length){const tr=document.createElement('tr'),td=createTextEl('td','No agents detected yet','empty');td.setAttribute('colspan','4');tr.appendChild(td);tbody.appendChild(tr);return}agents.forEach(a=>{const ns=normalizeStatus(a.status),tr=document.createElement('tr');tr.appendChild(createTextEl('td',a.agent));const std=document.createElement('td'),dot=document.createElement('span');dot.className='status-dot '+ns+(ns==='running'?' pulse':'');std.appendChild(dot);std.appendChild(createTextEl('span',ns,'status-text'));tr.appendChild(std);tr.appendChild(createTextEl('td',a.turn!=null?String(a.turn):'-'));tr.appendChild(createTextEl('td',a.task||''));tbody.appendChild(tr)})}
    function renderActivity(activity){const list=$('#activityList');clearChildren(list);if(!activity||!activity.length){list.appendChild(createTextEl('li','No activity yet','empty'));return}activity.forEach(a=>{const li=document.createElement('li');li.appendChild(createTextEl('span','['+a.agent+']','activity-agent'));li.appendChild(createTextEl('span',a.message,'activity-msg'));list.appendChild(li)})}
    function renderState(state){$('#sessionId').textContent=state.session?.id||'N/A';const st=(state.session?.status||'UNKNOWN').toUpperCase(),sel=$('#sessionStatus');sel.textContent=st;sel.className='session-status '+st.toLowerCase();if(state.updatedAt){const ts=new Date(state.updatedAt).toLocaleString();$('#updatedAt').textContent='Updated: '+ts;$('#footerTime').textContent=ts}renderAgents(state.agents);renderActivity(state.activity)}
    let ws,rd=1000;function connect(){const b=$('#connBadge');b.textContent='Connecting...';b.className='connection-badge connecting';const p=location.protocol==='https:'?'wss:':'ws:';ws=new WebSocket(p+'//'+location.host);ws.onopen=()=>{b.textContent='Connected';b.className='connection-badge connected';rd=1000};ws.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.data)renderState(m.data)}catch{}};ws.onclose=()=>{b.textContent='Disconnected';b.className='connection-badge disconnected';setTimeout(()=>{rd=Math.min(rd*1.5,10000);connect()},rd)};ws.onerror=()=>ws.close()}
    fetch('/api/state').then(r=>r.json()).then(renderState).catch(()=>{});connect();
  </script>
</body>
</html>`;

export function startDashboard() {
  const memoriesDir = resolveMemoriesDir();
  if (!existsSync(memoriesDir)) mkdirSync(memoriesDir, { recursive: true });

  const server = createServer((req, res) => {
    if (req.url === "/api/state") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(buildFullState(memoriesDir)));
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(HTML);
    }
  });

  const wss = new WebSocketServer({ server });
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function broadcast(event?: string, file?: string) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const msg = JSON.stringify({
        type: "update",
        event,
        file,
        data: buildFullState(memoriesDir),
      });
      wss.clients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) c.send(msg);
      });
    }, 100);
  }

  const watcher = watch(memoriesDir, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
  });
  watcher.on("all", (event, filePath) => broadcast(event, basename(filePath)));

  wss.on("connection", (ws) => {
    ws.send(
      JSON.stringify({ type: "full", data: buildFullState(memoriesDir) }),
    );
    ws.on("error", () => ws.terminate());
  });

  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    watcher.close();
    wss.clients.forEach((c) => {
      c.terminate();
    });
    wss.close(() => server.close(() => process.exit(0)));
    setTimeout(() => process.exit(1), 3000).unref();
  });
  process.on("SIGTERM", () => process.emit("SIGINT"));

  server.listen(PORT, () => {
    console.log(pc.magenta(`\n  🛸 Serena Memory Dashboard`));
    console.log(pc.white(`     http://localhost:${PORT}`));
    console.log(pc.dim(`     Watching: ${memoriesDir}\n`));
  });
}
