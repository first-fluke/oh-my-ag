---
name: multi-agent-workflow
description: Guide for coordinating PM, Frontend, Backend, Mobile, and QA agents on complex projects using Antigravity's Agent Manager UI
---

# Multi-Agent Workflow Guide

## Use this skill when

- Complex feature spanning multiple domains (full-stack app, mobile app)
- Coordination needed between frontend, backend, mobile, and QA
- Orchestrating multiple specialized agents working in parallel

## Do not use this skill when

- Simple single-domain task (use the specific agent directly)
- Quick bug fixes or minor changes
- Documentation-only work

## Important

This is a WORKFLOW GUIDE. You help the user coordinate agents via Antigravity's Agent Manager UI (Mission Control dashboard). The user manually spawns agents based on your guidance.

## Workflow

### Step 1: Planning with PM Agent

Say: "Let me consult the PM Agent to analyze and break down this project..."

The PM Agent will:
- Analyze requirements and choose tech stack
- Create task breakdown with priorities and dependencies
- Generate Plan Artifact saved to `.agent/plan.json`

### Step 2: Spawn Agents in Agent Manager

Based on the PM plan, guide the user:

"Open Agent Manager and spawn these agents in parallel:

**Priority 1 (Independent)**:
- Backend Agent: [task description]
- Frontend Agent: [task description]

**Priority 2 (After P1 completes)**:
- QA Agent: Review all deliverables

**How to spawn**:
1. Open Agent Manager panel (Mission Control)
2. Click 'New Agent'
3. Select skill (backend-agent, frontend-agent, etc.)
4. Paste the task description
5. Assign separate workspaces to avoid conflicts"

### Step 3: Monitor Progress

"Agents work independently. Monitor via Agent Manager inbox. Watch for:
- API contracts alignment between frontend/backend
- Shared data model consistency
- Questions from agents in inbox"

### Step 4: Coordinate Integration

Review outputs in `.gemini/antigravity/brain/` and ensure:
- API endpoint paths match
- Request/response formats align
- Authentication flow works end-to-end

### Step 5: QA Review

"Spawn QA Agent to review everything:
- Security (OWASP Top 10)
- Performance (API latency, bundle size)
- Accessibility (WCAG 2.1 AA)

Address CRITICAL issues immediately by re-spawning relevant agents."

## Parallel Execution Strategy

```
Priority 1 (Independent - Spawn Together):
  - Backend Agent -> Auth API
  - Frontend Agent -> Login UI
  - Mobile Agent -> Auth Screens

Priority 2 (Depends on P1):
  - Backend Agent -> CRUD API
  - Frontend Agent -> List UI

Priority 3 (Final Review):
  - QA Agent -> Security & Performance Audit
```

## Workspace Organization

```
./backend    -> Backend Agent workspace
./frontend   -> Frontend Agent workspace
./mobile     -> Mobile Agent workspace
./docs       -> Shared documentation
```

## Task Description Template

Good:
```
"Implement JWT authentication API with:
- POST /api/auth/register (email, password)
- POST /api/auth/login (returns access + refresh tokens)
- Password hashing with bcrypt
- Rate limiting: 5 attempts/minute on login"
```

Bad:
```
"Make authentication work"
```

## Knowledge Base Structure

All agents save outputs to `.gemini/antigravity/brain/`:
- `backend-[task].md` - Backend Agent output
- `frontend-[task].md` - Frontend Agent output
- `qa-security-report.md` - QA Agent report

## Agent Invocation Triggers

| Agent | Trigger phrases |
|-------|-----------------|
| PM Agent | "plan this project", "break down" |
| Frontend Agent | UI/UX work, components |
| Backend Agent | APIs, databases, auth |
| Mobile Agent | iOS/Android app |
| QA Agent | "review security", "check performance" |
| Debug Agent | Bug reports, error messages |

## Troubleshooting

**Agents modifying same file**: Assign separate workspaces or sequence them
**Dependency deadlock**: Review plan and break the cycle
**Outputs don't align**: Review both, re-spawn one agent with corrected spec
