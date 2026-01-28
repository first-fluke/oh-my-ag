# Integration Guide for Existing Projects

**This guide is for developers** integrating Antigravity Multi-Agent Skills into an existing project.

---

## Quick Integration

### Step 1: Clone This Repository

```bash
cd /tmp
git clone https://github.com/gahyun-git/subagent-orchestrator.git
cd subagent-orchestrator
```

### Step 2: Copy Skills to Your Project

```bash
# Navigate to your existing Antigravity project
cd /path/to/your-project

# Option A: Copy all skills
cp -r /tmp/subagent-orchestrator/.agent/skills .agent/

# Option B: Copy specific skills
cp -r /tmp/subagent-orchestrator/.agent/skills/backend-agent .agent/skills/
cp -r /tmp/subagent-orchestrator/.agent/skills/frontend-agent .agent/skills/
cp -r /tmp/subagent-orchestrator/.agent/skills/debug-agent .agent/skills/
# ... add more as needed
```

### Step 3: Open in Antigravity

```bash
antigravity open .
```

**That's it!** Antigravity automatically detects skills in `.agent/skills/`.

---

## Full Integration with Dashboards

If you want real-time monitoring dashboards, do this additionally:

### Step 1: Install Dependencies

```bash
cd /path/to/your-project
npm install chokidar ws
```

### Step 2: Copy Dashboard Scripts

```bash
# Copy terminal dashboard
cp /tmp/subagent-orchestrator/scripts/dashboard.sh ./scripts/

# Copy web dashboard
cp -r /tmp/subagent-orchestrator/scripts/dashboard-web ./scripts/
```

### Step 3: Add npm Scripts

Edit your `package.json`:

```json
{
  "scripts": {
    "dashboard": "bash scripts/dashboard.sh",
    "dashboard:web": "node scripts/dashboard-web/server.js"
  },
  "dependencies": {
    "chokidar": "^4.0.0",
    "ws": "^8.18.0"
  }
}
```

### Step 4: Use Dashboards

```bash
# Terminal dashboard (watches .serena/memories/)
npm run dashboard

# Web dashboard (http://localhost:9847)
npm run dashboard:web
```

---

## Project Structure After Integration

Your project should now look like:

```
your-project/
├── .agent/
│   └── skills/
│       ├── workflow-guide/         ← newly integrated
│       ├── pm-agent/               ← newly integrated
│       ├── frontend-agent/         ← newly integrated
│       ├── backend-agent/          ← newly integrated
│       ├── mobile-agent/           ← newly integrated
│       ├── qa-agent/               ← newly integrated
│       ├── debug-agent/            ← newly integrated
│       └── orchestrator/           ← newly integrated
│       └── (your existing skills, if any)
├── .serena/
│   └── memories/                   ← created automatically
├── scripts/
│   ├── dashboard.sh                ← newly integrated (optional)
│   └── dashboard-web/              ← newly integrated (optional)
├── package.json                    ← updated with dependencies
└── (your existing code)
```

---

## Using the Skills

### In Antigravity IDE

Simply **chat** with your existing Antigravity project:

**Simple task:**
```
"Create a React button component with Tailwind CSS"
→ frontend-agent loads automatically
```

**Complex project:**
```
"Build a TODO app with user authentication"
→ workflow-guide activates
→ PM Agent creates plan
→ You spawn agents in Agent Manager
```

### Via CLI (Orchestrator)

If your project has orchestrator skill, spawn agents programmatically:

```bash
# Single agent
./scripts/spawn-subagent.sh backend "Implement JWT auth" ./backend

# Multiple agents in parallel
./scripts/spawn-subagent.sh backend "Implement auth API" ./backend &
./scripts/spawn-subagent.sh frontend "Create login UI" ./frontend &
./scripts/spawn-subagent.sh qa "Security audit" ./qa &
wait
```

Monitor progress:
```bash
npm run dashboard:web
# → http://localhost:9847
```

---

## Customizing Skills for Your Project

### Edit Skill Instructions

Each skill is in `.agent/skills/{skill-name}/SKILL.md`. Edit to customize:

```bash
# Example: Customize frontend-agent for your stack
vim .agent/skills/frontend-agent/SKILL.md
```

Antigravity picks up changes automatically.

### Add Your Own Skills

Create a new skill folder:

```bash
mkdir -p .agent/skills/your-agent
cat > .agent/skills/your-agent/SKILL.md << 'EOF'
---
name: your-agent
description: Your custom agent description
---

# Your Agent

[Your instructions here]
EOF
```

### Mix with Existing Skills

If you already had skills before integration, they coexist:

```
.agent/skills/
├── your-existing-skill/          ← your original skill
├── your-other-skill/             ← your original skill
├── backend-agent/                ← newly integrated
├── frontend-agent/               ← newly integrated
└── ... (and so on)
```

All work together seamlessly.

---

## Configuration

### Orchestrator Configuration

Edit `.agent/skills/orchestrator/config/cli-config.yaml`:

```yaml
active_vendor: gemini  # or claude, codex, qwen
default_workspace: ./  # where agents write output
memory_tracking: true  # enable Serena Memory tracking
```

### Dashboard Settings

Terminal dashboard respects environment variables:

```bash
# Watch specific session
scripts/dashboard.sh session-20260128-143022

# Or just run with defaults
npm run dashboard
```

Web dashboard settings are in `scripts/dashboard-web/server.js`:

```javascript
const PORT = 9847;  // change if needed
const MEMORIES_DIR = path.join(PROJECT_ROOT, ".serena", "memories");  // path to watch
```

---

## Troubleshooting

### Skills Not Loading in Antigravity

1. Verify `.agent/skills/` folder exists:
   ```bash
   ls -la .agent/skills/
   ```

2. Check each skill has `SKILL.md`:
   ```bash
   find .agent/skills/ -name "SKILL.md"
   ```

3. Restart Antigravity IDE

### Dashboard Won't Start

```bash
# Check dependencies
npm list chokidar ws

# If missing, reinstall
npm install chokidar ws

# Try starting again
npm run dashboard:web
```

### Terminal Dashboard: "fswatch not found"

**macOS:**
```bash
brew install fswatch
```

**Linux:**
```bash
apt install inotify-tools
```

### Agents Producing Incompatible Output

1. Check knowledge base for alignment:
   ```bash
   cat .gemini/antigravity/brain/api-contract.md
   ```

2. Re-spawn agent with reference:
   ```
   "The backend created POST /api/auth/login at that exact path, make sure your frontend calls it"
   ```

### Port 9847 Already in Use

Change port in `scripts/dashboard-web/server.js`:

```javascript
const PORT = 9848;  // or any other free port
```

Then access `http://localhost:9848`

---

## Best Practices

1. **Commit after integration**
   ```bash
   git add .agent/skills scripts/dashboard* package.json
   git commit -m "feat: Integrate Antigravity Multi-Agent Skills"
   ```

2. **Customize for your tech stack** — Edit skill instructions to match your frameworks and patterns

3. **Keep orchestrator config in version control** — `.agent/skills/orchestrator/config/cli-config.yaml`

4. **Use separate workspaces** — When spawning agents via CLI, assign each a directory:
   ```bash
   ./scripts/spawn-subagent.sh backend "task" ./backend-work
   ./scripts/spawn-subagent.sh frontend "task" ./frontend-work
   ```

5. **Monitor with dashboards** — Run `npm run dashboard:web` in one terminal, spawn agents in another

6. **Review Knowledge Base** — Check `.gemini/antigravity/brain/` for agent outputs and alignment

7. **Iterate with re-spawns** — Don't start from scratch; re-spawn agent with refined instructions

---

## Next Steps

After integration:

1. **Chat in Antigravity** — Try a simple request to test
2. **Review PM Agent plan** — Run a complex request to see task breakdown
3. **Spawn agents via Agent Manager** — For multi-agent projects
4. **Monitor with dashboards** — Run `npm run dashboard` or `npm run dashboard:web`
5. **Customize skills** — Edit `.agent/skills/*/SKILL.md` for your stack
6. **Add your own skills** — Create custom agents in `.agent/skills/`

---

## Support

- **Skills documentation** — See individual `SKILL.md` files in `.agent/skills/`
- **Usage examples** — See [USAGE.md](./USAGE.md) or [USAGE-ko.md](./USAGE-ko.md)
- **Antigravity docs** — https://antigravity.google/docs/skills
- **This repo** — https://github.com/gahyun-git/subagent-orchestrator

---

**You now have professional multi-agent capabilities in your project!**
