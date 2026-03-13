# Supported Agents

`oh-my-agent` uses `.agents/` as the project-level source of truth for skills, workflows, and shared resources.

The installer can then project compatibility to other tool-specific directories with symlinks where needed.

## Support Matrix

| Tool / IDE | Project Skill Path | Status | Interop Mode | Notes |
|------------|--------------------|--------|--------------|-------|
| Antigravity | `.agents/skills/` | First-class | Native | Primary source-of-truth layout |
| Claude Code | `.claude/skills/` | First-class | Symlink from `.agents/skills/` | Installed by default for compatibility |
| OpenCode | `.agents/skills/` | First-class | Native-compatible | Shares the same project-level source |
| Amp | `.agents/skills/` | First-class | Native-compatible | Shares the same project-level source |
| Codex CLI | `.agents/skills/` | First-class | Native-compatible | Shares the same project-level source |
| Cursor | `.agents/skills/` | First-class | Native-compatible | Can consume the same project-level skill source |
| GitHub Copilot | `.github/skills/` | Supported | Optional symlink | Created when selected during install |

## What “First-class” Means

- The installer understands the tool's expected project layout
- Skills remain authored once under `.agents/skills/`
- Interop directories are generated rather than becoming separate sources of truth
- Workflows and shared resources continue to be managed from the same project structure

## Current Design Principle

`oh-my-agent` does not want one repository per IDE.

Instead:

1. author skills once under `.agents/`
2. generate compatibility views for each tool
3. keep workflows and shared resources portable
4. preserve one source of truth for versioning and maintenance

## Related Docs

- [AGENTS_SPEC.md](./AGENTS_SPEC.md)
- [README.md](../README.md)
- [web/content/en/guide/integration.md](../web/content/en/guide/integration.md)
