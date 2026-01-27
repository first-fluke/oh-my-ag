# Antigravity Multi-Agent Orchestrator

A comprehensive multi-agent system for Google Antigravity that orchestrates specialized agents (PM, Frontend, Backend, Mobile, QA) to collaboratively build software projects.

## Overview

This project implements a sophisticated agent orchestration system using Google Antigravity's native Skills feature. Instead of a single monolithic AI agent, work is distributed across five specialized agents, each expert in their domain:

- **PM Agent**: Requirements analysis, task decomposition, architecture planning
- **Frontend Agent**: React/Next.js UI implementation, TypeScript, Tailwind CSS
- **Backend Agent**: FastAPI/Node.js APIs, database design, authentication
- **Mobile Agent**: Flutter cross-platform mobile development
- **QA Agent**: Security audits, performance testing, accessibility compliance

## Key Features

- **Native Antigravity Skills**: Uses `.agent/skills/` directory structure
- **Parallel Execution**: Independent tasks run concurrently for efficiency
- **Dependency Management**: Automatic task ordering based on dependencies
- **Knowledge Base**: All decisions and outputs stored in `.gemini/antigravity/brain/`
- **Serena MCP Integration**: Code analysis and efficient modifications
- **Comprehensive QA**: Security (OWASP Top 10), performance, accessibility

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Orchestrator                        │
│  (orchestrator.ts - coordinates all agents)          │
└──────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌────────┐     ┌─────────┐     ┌─────────┐
    │PM Agent│────>│ Frontend│     │ Backend │
    └────────┘     │  Agent  │     │  Agent  │
         │         └─────────┘     └─────────┘
         │               │               │
         │               └───────┬───────┘
         ▼                       ▼
    ┌─────────┐           ┌──────────┐
    │ Mobile  │           │QA Agent  │
    │  Agent  │           │(Reviews) │
    └─────────┘           └──────────┘
```

## Installation

### Prerequisites

1. **Google Antigravity** (2026+)
   ```bash
   # Download from https://antigravity.google/download
   # Or install via package manager
   brew install google-antigravity  # macOS
   ```

2. **Node.js** 18+
   ```bash
   node --version  # Should be >= 18
   ```

3. **Serena MCP** (Optional but recommended)
   ```bash
   pip install git+https://github.com/oraios/serena
   ```

### Setup

1. Clone and install dependencies:
   ```bash
   git clone <repository-url>
   cd subagent-orchestrator
   npm install
   ```

2. Configure Serena MCP (optional):
   ```bash
   npm run setup:serena
   # Or manually: antigravity mcp add serena
   ```

3. Validate installation:
   ```bash
   npm run validate
   ```

## Project Structure

```
.
├── .agent/
│   ├── skills/                    # Antigravity Skills
│   │   ├── orchestrator/
│   │   │   └── SKILL.md          # Main orchestrator skill
│   │   ├── pm-agent/
│   │   │   ├── SKILL.md          # PM agent skill
│   │   │   └── resources/
│   │   │       └── task-template.json
│   │   ├── frontend-agent/
│   │   │   ├── SKILL.md
│   │   │   └── resources/
│   │   │       ├── component-template.tsx
│   │   │       └── tailwind-rules.md
│   │   ├── backend-agent/
│   │   │   ├── SKILL.md
│   │   │   └── resources/
│   │   │       └── api-template.py
│   │   ├── mobile-agent/
│   │   │   ├── SKILL.md
│   │   │   └── resources/
│   │   │       └── screen-template.dart
│   │   └── qa-agent/
│   │       ├── SKILL.md
│   │       └── resources/
│   │           └── checklist.md
│   ├── mcp.json                  # Serena MCP configuration
│   └── plan.json                 # Generated task plan (created at runtime)
├── .gemini/
│   └── antigravity/
│       └── brain/                # Knowledge Base (outputs stored here)
├── orchestrator.ts               # Main orchestration script
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

### Basic Usage

```bash
npm run orchestrate "Build a TODO app with user authentication"
```

### Example Requests

```bash
# Simple CRUD application
npm run orchestrate "Create a blog platform with posts and comments"

# Full-stack with auth
npm run orchestrate "Build an e-commerce site with product catalog, cart, and Stripe checkout"

# Mobile app
npm run orchestrate "Create a fitness tracking mobile app with workout history"

# API-only
npm run orchestrate "Design a RESTful API for a library management system"
```

## How It Works

### 1. Task Decomposition (PM Agent)

The PM Agent analyzes your request and generates a structured plan:

```json
{
  "project_name": "TODO App",
  "tasks": [
    {
      "id": "task-1",
      "agent": "backend",
      "title": "User authentication API",
      "priority": 1,
      "dependencies": [],
      "acceptance_criteria": ["JWT tokens", "Password hashing"]
    },
    {
      "id": "task-2",
      "agent": "frontend",
      "title": "Login UI",
      "priority": 1,
      "dependencies": [],
      "acceptance_criteria": ["Form validation", "Loading states"]
    },
    {
      "id": "task-3",
      "agent": "qa",
      "title": "Security audit",
      "priority": 2,
      "dependencies": ["task-1", "task-2"]
    }
  ]
}
```

### 2. Parallel Execution

Tasks at the same priority level with no dependencies run in parallel:

```
Priority 1:  [Backend Auth] + [Frontend UI]  (parallel)
             ↓
Priority 2:  [QA Review]                     (after both complete)
```

### 3. Knowledge Base Storage

All outputs are saved to `.gemini/antigravity/brain/`:

```
.gemini/antigravity/brain/
├── current-plan.md
├── 2026-01-27-backend-task-1.md
├── 2026-01-27-frontend-task-2.md
├── qa-report.md
└── orchestration-summary.json
```

### 4. Final QA Review

The QA Agent reviews all deliverables and generates a comprehensive report covering:
- Security vulnerabilities (OWASP Top 10)
- Performance metrics (API latency, bundle size, Web Vitals)
- Accessibility compliance (WCAG 2.1 AA)
- Code quality (test coverage, complexity)
- Browser automation test results

## Skills Reference

### PM Agent

**When to use**: Always called first to decompose requirements

**Output**: JSON plan with tasks, priorities, dependencies, tech stack decisions

**Example**:
```bash
antigravity agent run \
  --skill .agent/skills/pm-agent \
  --instruction "Plan a real-time chat application"
```

### Frontend Agent

**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui

**Output**: React components, tests, Storybook stories

**Best for**: UI implementation, client-side logic, responsive design

### Backend Agent

**Tech Stack**: FastAPI (Python), SQLAlchemy, PostgreSQL, Redis

**Output**: API endpoints, database models, integration tests, OpenAPI spec

**Best for**: REST APIs, authentication, database design

### Mobile Agent

**Tech Stack**: Flutter, Dart, Riverpod

**Output**: Mobile screens, state management, platform-specific code

**Best for**: iOS + Android cross-platform apps

### QA Agent

**Checks**: Security, performance, accessibility, code quality

**Output**: Comprehensive QA report with prioritized issues and remediation steps

**Best for**: Final review before deployment

## Configuration

### Environment Variables

Create a `.env` file (not tracked in git):

```bash
# Antigravity Model (optional)
ANTIGRAVITY_MODEL=gemini-3-pro  # or gemini-3-flash for faster/cheaper

# Serena Configuration (optional)
SERENA_LOG_LEVEL=info
```

### Custom Configuration

Edit `orchestrator.ts`:

```typescript
const CONFIG = {
  skillsPath: '.agent/skills',
  outputPath: '.gemini/antigravity/brain',
  planFile: '.agent/plan.json',
  agentModel: 'gemini-3-pro',     // Change model here
  outputFormat: 'markdown',
  maxRetries: 3,                  // Retry failed agents
  retryDelay: 2000,               // ms between retries
};
```

## Advanced Usage

### Running Individual Agents

```bash
# Run PM Agent directly
antigravity agent run \
  --skill .agent/skills/pm-agent \
  --instruction "Plan an inventory management system" \
  --model gemini-3-pro

# Run Frontend Agent
antigravity agent run \
  --skill .agent/skills/frontend-agent \
  --instruction "Build a product catalog with filtering and search"

# Run QA Agent
antigravity agent run \
  --skill .agent/skills/qa-agent \
  --instruction "Review the authentication implementation for security issues"
```

### Using Serena for Code Analysis

Agents automatically use Serena MCP when available:

```typescript
// In any agent, these tools are available:
// - find_symbol("LoginForm")
// - get_symbols_overview("src/components")
// - find_referencing_symbols("Button")
// - replace_symbol_body("LoginForm", newCode)
// - search_for_pattern("password.*=.*")
```

### Customizing Skills

Edit any `.agent/skills/*/SKILL.md` file to customize agent behavior:

```markdown
---
name: frontend-agent
description: Frontend specialist for React, Next.js, and modern UI
---

# Frontend Agent

## Use this skill when
- Building user interfaces
- (Add your custom conditions)

## Instructions
1. Follow Material Design 3
2. (Add your custom steps)
```

## Troubleshooting

### Agent Fails to Start

```bash
# Check Antigravity installation
antigravity --version

# Validate skills
npm run validate

# Check skill file exists
ls -la .agent/skills/*/SKILL.md
```

### JSON Parsing Error

If PM Agent output can't be parsed:

1. Check the raw output in terminal
2. Ensure the plan follows the template in `.agent/skills/pm-agent/resources/task-template.json`
3. Try with a simpler request first

### Serena Not Found

```bash
# Install Serena
pip install git+https://github.com/oraios/serena

# Add to Antigravity
antigravity mcp add serena

# Verify
antigravity mcp list
```

### Performance Issues

```bash
# Use faster model
export ANTIGRAVITY_MODEL=gemini-3-flash

# Or edit orchestrator.ts
agentModel: 'gemini-3-flash',
```

## Best Practices

### 1. Clear Requirements

❌ Bad: "Make it better"
✅ Good: "Add user authentication with email/password, JWT tokens, and password reset"

### 2. Incremental Complexity

Start simple, then iterate:

```bash
# Step 1: Basic CRUD
npm run orchestrate "Create a simple TODO list (no auth)"

# Step 2: Add features
npm run orchestrate "Add user authentication to the TODO app"

# Step 3: Enhance
npm run orchestrate "Add real-time collaboration to the TODO app"
```

### 3. Review Outputs

Always check `.gemini/antigravity/brain/`:
- `current-plan.md`: Verify task breakdown
- `qa-report.md`: Address critical issues
- `orchestration-summary.json`: Check success rate

### 4. Iterative QA

Run QA multiple times as you fix issues:

```bash
# Initial QA
npm run orchestrate "Review security of the authentication system"

# After fixes
npm run orchestrate "Re-audit authentication after implementing rate limiting"
```

## Limitations

- **Antigravity Required**: This system only works with Google Antigravity
- **Model Costs**: Using Gemini 3 Pro may incur costs (check Antigravity pricing)
- **No Rollback**: Failed agents don't automatically roll back changes
- **Linear Dependencies**: Circular dependencies not supported

## Contributing

Contributions welcome! Areas for improvement:

- Additional agent specializations (DevOps, Data Science, ML)
- More sophisticated dependency resolution
- Retry with different strategies on failure
- Integration with CI/CD pipelines
- Web UI for orchestration management

## License

MIT License - see LICENSE file

## References

- [Google Antigravity Documentation](https://antigravity.google/docs)
- [Antigravity Skills Guide](https://codelabs.developers.google.com/getting-started-with-antigravity-skills)
- [Serena MCP](https://github.com/oraios/serena)
- [Agent Skills Standard](https://blog.devgenius.io/google-antigravity-adds-skills-04ab11d8497c)

## Support

For issues related to:
- **This orchestrator**: Open an issue in this repository
- **Antigravity**: Check [Antigravity Help](https://antigravity.google/help)
- **Serena**: Check [Serena GitHub](https://github.com/oraios/serena/issues)

---

**Built for Google Antigravity 2026**

Last updated: January 2026
