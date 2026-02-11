---
title: Existing Project Integration
description: Safe and non-destructive integration workflow for adding oh-my-ag skills to an existing Antigravity project.
---

# Integrate Into an Existing Project

This guide replaces the legacy root `AGENT_GUIDE.md` workflow and reflects the current workspace structure (`cli` + `web`) and CLI behavior.

## Goal

Add `oh-my-ag` skills to an existing project without overwriting current assets.

## Recommended Path (CLI)

Run this in the target project root:

```bash
bunx oh-my-ag
```

What it does:

- Installs or updates `.agent/skills/*`
- Installs shared resources in `.agent/skills/_shared`
- Installs `.agent/workflows/*`
- Installs `.agent/config/user-preferences.yaml`
- Optionally installs global workflows under `~/.gemini/antigravity/global_workflows`

## Safe Manual Path

Use this when you need full control over each copied directory.

```bash
cd /path/to/your-project

mkdir -p .agent/skills .agent/workflows .agent/config

# Copy only missing skill directories (example)
for skill in workflow-guide pm-agent frontend-agent backend-agent mobile-agent qa-agent debug-agent orchestrator commit; do
  if [ ! -d ".agent/skills/$skill" ]; then
    cp -r /path/to/oh-my-ag/.agent/skills/$skill .agent/skills/$skill
  fi
done

# Copy shared resources if missing
[ -d .agent/skills/_shared ] || cp -r /path/to/oh-my-ag/.agent/skills/_shared .agent/skills/_shared

# Copy workflows if missing
for wf in coordinate.md orchestrate.md plan.md review.md debug.md setup.md tools.md; do
  [ -f ".agent/workflows/$wf" ] || cp /path/to/oh-my-ag/.agent/workflows/$wf .agent/workflows/$wf
done

# Copy default user preferences only if missing
[ -f .agent/config/user-preferences.yaml ] || cp /path/to/oh-my-ag/.agent/config/user-preferences.yaml .agent/config/user-preferences.yaml
```

## Verification Checklist

```bash
# 9 installable skills (excluding _shared)
find .agent/skills -mindepth 1 -maxdepth 1 -type d ! -name '_shared' | wc -l

# Shared resources
[ -d .agent/skills/_shared ] && echo ok

# 7 workflows
find .agent/workflows -maxdepth 1 -name '*.md' | wc -l

# Basic command health
bunx oh-my-ag doctor
```

## Optional Dashboards

Dashboards are optional and use the installed CLI:

```bash
bunx oh-my-ag dashboard
bunx oh-my-ag dashboard:web
```

Web dashboard default URL: `http://localhost:9847`

## Rollback Strategy

Before integration, create a checkpoint commit in your project:

```bash
git add -A
git commit -m "chore: checkpoint before oh-my-ag integration"
```

If you need to undo, revert that commit with your normal team process.

## Multi-CLI Symlink Support

When you run `bunx oh-my-ag`, you'll see this prompt after selecting skills:

```text
Also develop with other CLI tools?
  ○ Claude Code (.claude/skills/)
  ○ OpenCode, Amp, Codex (.agents/skills/)
```

Select any additional CLI tools you use alongside Antigravity. The installer will:

1. Install skills to `.agent/skills/` (Antigravity's native location)
2. Create symlinks from each selected CLI's skills directory to `.agent/skills/`

This ensures a single source of truth while allowing skills to work across multiple CLI tools.

### Symlink Structure

```
.agent/skills/frontend-agent/      ← Source (SSOT)
.claude/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/
.agents/skills/frontend-agent/     → ../../.agent/skills/frontend-agent/ (OpenCode, Amp, Codex)
```

The installer skips existing symlinks and warns if a real directory exists at the target location.

## Notes

- Do not overwrite existing `.agent/skills/*` folders unless you intend to replace customized skills.
- Keep project-specific policy files (`.agent/config/*`) under your repository ownership.
- For multi-agent orchestration patterns, continue with the [`Usage Guide`](./usage.md).
