---
name: multi-agent-workflow
description: Guide for coordinating PM, Frontend, Backend, Mobile, and QA agents on complex projects using Antigravity's Agent Manager UI
---

# Multi-Agent Workflow Guide

## Use this skill when

- The user requests a complex feature spanning multiple domains (full-stack app, mobile app, etc.)
- The project requires coordination between frontend, backend, mobile, and QA work
- You need to help the user orchestrate multiple specialized agents working in parallel

## Do not use this skill when

- The task is simple and confined to a single domain (use the specific agent skill directly)
- Quick bug fixes or minor changes
- Only documentation work

## Important: How This Skill Works

**This is a WORKFLOW GUIDE, not an automation script.**

You will help the user coordinate multiple agents using Antigravity's **Agent Manager UI** (the Mission Control dashboard). The user will manually spawn agents in the UI based on your guidance.

## Workflow for Complex Projects

When a complex project request comes in, guide the user through this workflow:

### Step 1: Task Planning with PM Agent

**Say to user**: "Let me start by consulting the PM Agent to analyze and break down this project..."

**Invoke the PM Agent skill** by naturally referencing it in your response. Antigravity's Progressive Disclosure will automatically load it.

The PM Agent will:
- Analyze requirements
- Choose appropriate tech stack
- Create a task breakdown with priorities and dependencies
- Generate a Plan Artifact (JSON format) saved to `.agent/plan.json`

### Step 2: Guide User to Agent Manager UI

**Based on the PM plan**, explain to the user:

"Based on this plan, I recommend spawning the following agents in Antigravity's Agent Manager:

**Priority 1 (Run in Parallel)**:
- **Backend Agent**: [specific task description]
- **Frontend Agent**: [specific task description]
- **Mobile Agent**: [specific task description] (if needed)

**Priority 2 (After P1 completes)**:
- **QA Agent**: Review all deliverables for security and performance

**How to spawn these agents:**
1. Open the Agent Manager panel (Mission Control)
2. Click 'New Agent' for each task
3. Select the appropriate skill (backend-agent, frontend-agent, etc.)
4. Copy-paste the task description I provided
5. Assign separate workspaces to avoid conflicts"

### Step 3: Monitor via Inbox

**Explain to user**: "The agents will work independently and ping you in the Agent Manager inbox when they need input or complete a milestone. You can monitor their progress and review artifacts as they're generated."

**What to watch for:**
- API contracts alignment between frontend/backend
- Shared data models consistency
- Dependencies being met before spawning dependent agents
- Questions from agents in the inbox

### Step 4: Coordinate Integration

**As agents complete, help coordinate:**

"Let's review what the Backend Agent created and ensure the Frontend Agent's API calls match the actual endpoints..."

**Check Knowledge Base** (`.gemini/antigravity/brain/`) for agent outputs:
- `backend-[task].md` - Backend agent's API implementation
- `frontend-[task].md` - Frontend agent's component code
- `mobile-[task].md` - Mobile agent's screens

**Ensure consistency:**
- API endpoint paths match
- Request/response formats align
- Data models are consistent
- Authentication flow works end-to-end

### Step 5: QA Review

**Once implementation agents complete:**

"Now let's have the QA Agent review everything. Spawn the QA Agent with this instruction:

'Review all deliverables from Backend, Frontend, and Mobile agents. Check for:
- Security vulnerabilities (OWASP Top 10)
- Performance issues (API latency, bundle size, Web Vitals)
- Accessibility compliance (WCAG 2.1 AA)
- Code quality and test coverage

Generate a comprehensive report with prioritized issues.'"

**Review QA report together:**
- Address CRITICAL issues immediately (re-spawn relevant agent with fixes)
- Schedule HIGH priority items
- Document MEDIUM/LOW for future sprints

## Agent Manager Best Practices

### Parallel Execution Strategy

Group tasks by priority to maximize efficiency:

```
Priority 1 (Independent - Spawn Together):
  ├─ Backend Agent → Auth API
  ├─ Frontend Agent → Login UI
  └─ Mobile Agent → Auth Screens

Priority 2 (Depends on P1 - Spawn After):
  ├─ Backend Agent → TODO CRUD API
  └─ Frontend Agent → TODO List UI

Priority 3 (Final Review):
  └─ QA Agent → Security & Performance Audit
```

### Workspace Organization

**Recommend separate workspaces** to prevent conflicts:

```
./backend    → Backend Agent workspace
./frontend   → Frontend Agent workspace
./mobile     → Mobile Agent workspace
./docs       → Shared documentation
```

### Task Description Template

**For each agent spawn, provide a clear, specific task description:**

✅ **Good**:
```
"Implement JWT-based user authentication API with:
- POST /api/auth/register (email, password)
- POST /api/auth/login (returns access + refresh tokens)
- POST /api/auth/refresh
- Password hashing with bcrypt (cost factor 12)
- Access tokens expire in 15 minutes
- Rate limiting: 5 attempts/minute on login endpoint"
```

❌ **Bad**:
```
"Make authentication work"
```

## Communication Between Agents

Agents don't directly communicate - **you coordinate through the user:**

1. **PM Agent** creates plan → Saved to `.agent/plan.json`
2. **Implementation Agents** work in parallel → Save to Knowledge Base
3. **You review KB** → Spot inconsistencies → Guide user to re-spawn with corrections
4. **QA Agent** reviews KB outputs → Generates report
5. **You coordinate fixes** → Re-spawn agents as needed

## Example: Full TODO App Project

**User**: "Build a TODO app with user authentication"

**Your guided response:**

### Phase 1: Planning

"Let me consult the PM Agent to break this down..."

*(PM Agent generates plan with 5 tasks)*

"Great! The PM Agent has created a plan with 5 tasks across 3 priority levels. Here's the breakdown:

**Priority 1** (2 tasks - independent):
- task-1: Backend authentication API
- task-2: Frontend login UI

**Priority 2** (2 tasks - depend on P1):
- task-3: Backend TODO CRUD API
- task-4: Frontend TODO list UI

**Priority 3** (1 task - final review):
- task-5: QA security and performance audit

The full plan is saved to `.agent/plan.json` and `.gemini/antigravity/brain/current-plan.md` for reference."

### Phase 2: Spawn P1 Agents

"Let's start with Priority 1. Open Agent Manager and spawn these two agents in parallel:

**Agent 1 - Backend Agent**
Task: 'Implement JWT-based authentication API with /register, /login, /refresh endpoints. Use bcrypt for password hashing, return access tokens (15min expiry) and refresh tokens (7 day expiry). Add rate limiting of 5 attempts/minute on login.'
Workspace: ./backend

**Agent 2 - Frontend Agent**
Task: 'Build login and registration UI using Next.js 14, TypeScript, and Tailwind CSS. Include form validation (email format, password min 8 chars), loading states, and error display. Use shadcn/ui components.'
Workspace: ./frontend

Both agents will work independently. Check the Agent Manager inbox for updates."

### Phase 3: Monitor & Coordinate

*(User: "Backend Agent is done")*

"Great! Let me review the Backend Agent's output in the Knowledge Base..."

*(You read `.gemini/antigravity/brain/backend-auth-api.md`)*

"I see the Backend Agent created:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh

The login endpoint returns `{access_token, refresh_token, user}`.

Once the Frontend Agent completes, make sure it calls these exact endpoints with the correct request/response format."

### Phase 4: Continue with P2

*(User: "Both P1 agents done")*

"Perfect! Now let's move to Priority 2. Spawn these agents:

**Agent 3 - Backend Agent** (same agent, new task)
Task: 'Implement TODO CRUD API: GET /api/todos (list), POST /api/todos (create), PATCH /api/todos/:id (update), DELETE /api/todos/:id (soft delete). Require JWT authentication. Use user_id from token to scope todos.'

**Agent 4 - Frontend Agent** (same agent, new task)
Task: 'Build TODO list UI with add/edit/delete/toggle complete actions. Use TanStack Query for API calls. Show loading skeletons and error states. Make it responsive for mobile.'

...and so on.

### Phase 5: QA Review

"Now let's spawn the QA Agent for final review..."

*(QA Agent generates security report)*

"The QA Agent found 2 HIGH priority issues:
1. Missing rate limiting on TODO endpoints (could be abused)
2. CORS not configured (frontend can't call API)

Let's re-spawn the Backend Agent to fix these..."

## When to Invoke Each Skill

### PM Agent
**Trigger phrases**: "plan this project", "break down", "what should we build first"
**Output**: Structured plan with tasks, priorities, dependencies

### Frontend Agent
**Trigger**: UI/UX work, client-side logic
**Output**: React components, tests, Storybook stories

### Backend Agent
**Trigger**: APIs, databases, authentication
**Output**: FastAPI endpoints, models, tests, OpenAPI docs

### Mobile Agent
**Trigger**: iOS/Android app needed
**Output**: Flutter screens, navigation, platform-specific code

### QA Agent
**Trigger**: "review for security", "check performance", "before deployment"
**Output**: Audit report with prioritized fixes

## Knowledge Base Structure

All agents save outputs to `.gemini/antigravity/brain/`:

```
.gemini/antigravity/brain/
├── current-plan.md              # PM Agent
├── decisions.md                 # Architecture decisions
├── backend-auth-api.md          # Backend Agent output
├── frontend-login-ui.md         # Frontend Agent output
├── mobile-auth-screens.md       # Mobile Agent output
├── qa-security-report.md        # QA Agent report
└── orchestration-notes.md       # Your coordination notes
```

**Use these for coordination**: "Based on the Backend Agent's API design in `backend-auth-api.md`, the Frontend Agent should..."

## Troubleshooting

### Agents Working on Conflicting Code

**Problem**: Two agents modifying the same file
**Solution**: Assign separate workspaces or sequence them (don't run in parallel)

### Dependency Deadlock

**Problem**: Task A waits for B, B waits for A
**Solution**: PM Agent should catch this - review plan and break the cycle

### Agent Confused or Stuck

**Problem**: Agent asking same question repeatedly
**Solution**: Provide more specific task description or examples

### Outputs Don't Align

**Problem**: Frontend expects different API format than Backend provides
**Solution**: Review both outputs, identify mismatch, re-spawn one agent with corrected spec

## Summary

**Key Points**:

✅ **This is a coordination guide** - you help the user orchestrate agents via Agent Manager UI
✅ **PM Agent always first** - creates the plan for complex projects
✅ **Spawn agents in Agent Manager** - not via terminal commands
✅ **Use Knowledge Base for coordination** - all agent outputs stored there
✅ **QA Agent at the end** - comprehensive review before deployment
✅ **Iterate as needed** - re-spawn agents to fix issues found by QA

**The power of this workflow:**
- Specialized expertise for each domain
- Parallel execution for efficiency
- Built-in quality assurance
- Knowledge persistence for coordination
- User stays in control via Agent Manager UI

Remember: **You are the guide**, the user operates the Agent Manager, and the specialized skills are the expert team members!
