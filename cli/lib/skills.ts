import {
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import type { SkillInfo, SkillsRegistry } from "../types/index.js";

export const REPO = "first-fluke/oh-my-ag";
export const GITHUB_RAW = `https://raw.githubusercontent.com/${REPO}/main/.agent/skills`;
export const GITHUB_AGENT_ROOT = `https://raw.githubusercontent.com/${REPO}/main/.agent`;

export const SKILLS: SkillsRegistry = {
  domain: [
    { name: "frontend-agent", desc: "React/Next.js UI specialist" },
    { name: "backend-agent", desc: "FastAPI/SQLAlchemy API specialist" },
    { name: "mobile-agent", desc: "Flutter/Dart mobile specialist" },
  ],
  coordination: [
    { name: "pm-agent", desc: "Product manager - task decomposition" },
    { name: "qa-agent", desc: "QA - OWASP, Lighthouse, WCAG" },
    { name: "workflow-guide", desc: "Manual multi-agent orchestration" },
    { name: "orchestrator", desc: "Automated parallel CLI execution" },
  ],
  utility: [
    { name: "debug-agent", desc: "Bug fixing specialist" },
    { name: "commit", desc: "Conventional Commits helper" },
  ],
};

export const PRESETS: Record<string, string[]> = {
  fullstack: [
    "frontend-agent",
    "backend-agent",
    "pm-agent",
    "qa-agent",
    "debug-agent",
    "commit",
  ],
  frontend: ["frontend-agent", "pm-agent", "qa-agent", "debug-agent", "commit"],
  backend: ["backend-agent", "pm-agent", "qa-agent", "debug-agent", "commit"],
  mobile: ["mobile-agent", "pm-agent", "qa-agent", "debug-agent", "commit"],
  all: [...SKILLS.domain, ...SKILLS.coordination, ...SKILLS.utility].map(
    (s) => s.name,
  ),
};

export async function fetchSkillFiles(skillName: string): Promise<string[]> {
  const files = ["SKILL.md"];
  const resourceFiles = [
    "resources/execution-protocol.md",
    "resources/tech-stack.md",
    "resources/checklist.md",
    "resources/templates.md",
    "resources/error-playbook.md",
  ];

  for (const file of resourceFiles) {
    const url = `${GITHUB_RAW}/${skillName}/${file}`;
    const res = await fetch(url, { method: "HEAD" });
    if (res.ok) files.push(file);
  }

  return files;
}

export async function installSkill(
  skillName: string,
  targetDir: string,
): Promise<boolean> {
  const skillDir = join(targetDir, ".agent", "skills", skillName);
  const files = await fetchSkillFiles(skillName);

  for (const file of files) {
    const url = `${GITHUB_RAW}/${skillName}/${file}`;
    const res = await fetch(url);
    if (!res.ok) continue;

    const content = await res.text();
    const filePath = join(skillDir, file);
    const fileDir = dirname(filePath);

    if (!existsSync(fileDir)) {
      mkdirSync(fileDir, { recursive: true });
    }
    writeFileSync(filePath, content, "utf-8");
  }

  return true;
}

export async function installShared(targetDir: string): Promise<void> {
  const sharedDir = join(targetDir, ".agent", "skills", "_shared");
  const files = [
    "reasoning-templates.md",
    "clarification-protocol.md",
    "context-loading.md",
    "skill-routing.md",
  ];

  if (!existsSync(sharedDir)) {
    mkdirSync(sharedDir, { recursive: true });
  }

  for (const file of files) {
    const url = `${GITHUB_RAW}/_shared/${file}`;
    const res = await fetch(url);
    if (!res.ok) continue;

    const content = await res.text();
    writeFileSync(join(sharedDir, file), content, "utf-8");
  }
}

export async function installWorkflows(targetDir: string): Promise<void> {
  const workflowsDir = join(targetDir, ".agent", "workflows");
  const files = [
    "coordinate.md",
    "debug.md",
    "orchestrate.md",
    "plan.md",
    "review.md",
    "setup.md",
    "tools.md",
  ];

  if (!existsSync(workflowsDir)) {
    mkdirSync(workflowsDir, { recursive: true });
  }

  for (const file of files) {
    const url = `${GITHUB_AGENT_ROOT}/workflows/${file}`;
    const res = await fetch(url);
    if (!res.ok) continue;

    const content = await res.text();
    writeFileSync(join(workflowsDir, file), content, "utf-8");
  }
}

export async function installConfigs(targetDir: string): Promise<void> {
  const configDir = join(targetDir, ".agent", "config");
  const agentDir = join(targetDir, ".agent");

  // Install config/user-preferences.yaml
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  const configFile = "user-preferences.yaml";
  const configUrl = `${GITHUB_AGENT_ROOT}/config/${configFile}`;
  const configRes = await fetch(configUrl);
  if (configRes.ok) {
    const content = await configRes.text();
    writeFileSync(join(configDir, configFile), content, "utf-8");
  }

  // Install mcp.json
  const mcpFile = "mcp.json";
  const mcpUrl = `${GITHUB_AGENT_ROOT}/${mcpFile}`;
  const mcpRes = await fetch(mcpUrl);
  if (mcpRes.ok) {
    const content = await mcpRes.text();
    writeFileSync(join(agentDir, mcpFile), content, "utf-8");
  }
}

export function getAllSkills(): SkillInfo[] {
  return [...SKILLS.domain, ...SKILLS.coordination, ...SKILLS.utility];
}

export type CliTool = "claude" | "opencode" | "amp" | "codex" | "copilot";

export const CLI_SKILLS_DIR: Record<CliTool, string> = {
  claude: ".claude/skills",
  opencode: ".agents/skills",
  amp: ".agents/skills",
  codex: ".agents/skills",
  copilot: ".github/skills",
};

export function createCliSymlinks(
  targetDir: string,
  cliTools: CliTool[],
  skillNames: string[],
): { created: string[]; skipped: string[] } {
  const created: string[] = [];
  const skipped: string[] = [];
  const ssotSkillsDir = resolve(targetDir, ".agent", "skills");

  for (const cli of cliTools) {
    const cliSkillsDir = join(targetDir, CLI_SKILLS_DIR[cli]);

    if (!existsSync(cliSkillsDir)) {
      mkdirSync(cliSkillsDir, { recursive: true });
    }

    for (const skillName of skillNames) {
      const source = join(ssotSkillsDir, skillName);
      const link = join(cliSkillsDir, skillName);

      if (!existsSync(source)) {
        skipped.push(`${cli}/${skillName} (source missing)`);
        continue;
      }

      try {
        const stat = lstatSync(link);
        if (stat.isSymbolicLink()) {
          const existing = resolve(dirname(link), readlinkSync(link));
          if (existing === resolve(source)) {
            skipped.push(`${cli}/${skillName} (already linked)`);
            continue;
          }
          unlinkSync(link);
        } else {
          skipped.push(`${cli}/${skillName} (real dir exists)`);
          continue;
        }
      } catch (_e) {}

      const relativePath = relative(cliSkillsDir, source);
      symlinkSync(relativePath, link, "dir");
      created.push(`${CLI_SKILLS_DIR[cli]}/${skillName}`);
    }
  }

  return { created, skipped };
}

export async function installGlobalWorkflows(): Promise<void> {
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const globalWorkflowsDir = join(
    homeDir,
    ".gemini",
    "antigravity",
    "global_workflows",
  );

  if (!existsSync(globalWorkflowsDir)) {
    mkdirSync(globalWorkflowsDir, { recursive: true });
  }

  const files = [
    "coordinate.md",
    "debug.md",
    "orchestrate.md",
    "plan.md",
    "review.md",
    "setup.md",
    "tools.md",
  ];

  for (const file of files) {
    const url = `${GITHUB_AGENT_ROOT}/workflows/${file}`;
    const res = await fetch(url);
    if (!res.ok) continue;

    const content = await res.text();
    writeFileSync(join(globalWorkflowsDir, file), content, "utf-8");
  }
}
