import { execSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  readlinkSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  CLI_SKILLS_DIR,
  getAllSkills,
  installShared,
  installSkill,
} from "../lib/skills.js";
import type { CLICheck, SkillCheck, SymlinkCheck } from "../types/index.js";

async function checkCLI(
  name: string,
  command: string,
  installCmd: string,
): Promise<CLICheck> {
  try {
    const version = execSync(`${command} --version`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    return { name, installed: true, version, installCmd };
  } catch {
    return { name, installed: false, installCmd };
  }
}

async function checkMCPConfig(
  cliName: string,
): Promise<{ configured: boolean; path?: string }> {
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const configs: Record<
    string,
    { path: string; type: "json" | "yaml" | "toml" }
  > = {
    gemini: { path: `${homeDir}/.gemini/settings.json`, type: "json" },
    claude: { path: `${homeDir}/.claude.json`, type: "json" },
    codex: { path: `${homeDir}/.codex/config.toml`, type: "toml" },
  };

  const config = configs[cliName];
  if (!config) return { configured: false };

  if (existsSync(config.path)) {
    try {
      const content = readFileSync(config.path, "utf-8");
      if (config.type === "json") {
        const json = JSON.parse(content);
        const hasMCP = json.mcpServers || json.mcp;
        return { configured: !!hasMCP, path: config.path };
      }
      return { configured: true, path: config.path };
    } catch {
      return { configured: false };
    }
  }

  return { configured: false };
}

async function checkSkills(): Promise<SkillCheck[]> {
  const skillsDir = join(process.cwd(), ".agent", "skills");
  if (!existsSync(skillsDir)) return [];

  const allSkills = getAllSkills();
  const checks: SkillCheck[] = [];

  for (const skill of allSkills) {
    const skillPath = join(skillsDir, skill.name);
    const skillMdPath = join(skillPath, "SKILL.md");

    checks.push({
      name: skill.name,
      installed: existsSync(skillPath),
      hasSkillMd: existsSync(skillMdPath),
    });
  }

  return checks;
}

async function checkGlobalWorkflows(): Promise<{
  installed: boolean;
  count: number;
}> {
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const globalWorkflowsDir = join(
    homeDir,
    ".gemini",
    "antigravity",
    "global_workflows",
  );

  if (!existsSync(globalWorkflowsDir)) return { installed: false, count: 0 };

  try {
    const files = readdirSync(globalWorkflowsDir).filter((f) =>
      f.endsWith(".md"),
    );
    return { installed: true, count: files.length };
  } catch {
    return { installed: false, count: 0 };
  }
}

async function checkSymlinks(cwd: string): Promise<SymlinkCheck[]> {
  const allSkills = getAllSkills();
  const ssotSkillsDir = join(cwd, ".agent", "skills");
  const checks: SymlinkCheck[] = [];

  for (const [cli, skillsDir] of Object.entries(CLI_SKILLS_DIR)) {
    const cliSkillsDir = join(cwd, skillsDir);
    const check: SymlinkCheck = {
      cli,
      skillsDir,
      exists: existsSync(cliSkillsDir),
      missingSkills: [],
      brokenLinks: [],
    };

    if (!check.exists) {
      checks.push(check);
      continue;
    }

    for (const skill of allSkills) {
      const sourcePath = join(ssotSkillsDir, skill.name);
      const linkPath = join(cliSkillsDir, skill.name);

      if (!existsSync(sourcePath)) {
        continue;
      }

      if (!existsSync(linkPath)) {
        check.missingSkills.push(skill.name);
        continue;
      }

      try {
        const stat = lstatSync(linkPath);
        if (stat.isSymbolicLink()) {
          const linkTarget = readlinkSync(linkPath);
          const resolvedTarget = resolve(dirname(linkPath), linkTarget);
          if (resolvedTarget !== resolve(sourcePath)) {
            check.brokenLinks.push(skill.name);
          }
        }
      } catch {
        check.brokenLinks.push(skill.name);
      }
    }

    checks.push(check);
  }

  return checks;
}

export async function doctor(jsonMode = false): Promise<void> {
  const cwd = process.cwd();

  const clis = await Promise.all([
    checkCLI("gemini", "gemini", "bun install --global @google/gemini-cli"),
    checkCLI(
      "claude",
      "claude",
      "bun install --global @anthropic-ai/claude-code",
    ),
    checkCLI("codex", "codex", "bun install --global @openai/codex"),
    checkCLI("qwen", "qwen", "bun install --global @qwen-code/qwen-code"),
  ]);

  const mcpChecks = await Promise.all(
    clis
      .filter((c) => c.installed)
      .map(async (cli) => {
        const mcp = await checkMCPConfig(cli.name);
        return { ...cli, mcp };
      }),
  );

  const skillChecks = await checkSkills();
  const globalWorkflows = await checkGlobalWorkflows();
  const symlinkChecks = await checkSymlinks(cwd);

  let rerereEnabled = false;
  try {
    const val = execSync("git config --get rerere.enabled", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    rerereEnabled = val === "true";
  } catch {}

  const serenaDir = join(cwd, ".serena", "memories");
  const hasSerena = existsSync(serenaDir);
  let serenaFileCount = 0;
  if (hasSerena) {
    try {
      serenaFileCount = readdirSync(serenaDir).length;
    } catch {}
  }

  const missingCLIs = clis.filter((c) => !c.installed);
  const missingSkills =
    skillChecks.length > 0
      ? skillChecks.filter((s) => !s.installed || !s.hasSkillMd)
      : getAllSkills().map((s) => ({
          name: s.name,
          installed: false,
          hasSkillMd: false,
        }));

  const symlinkIssues = symlinkChecks.filter(
    (c) => c.exists && (c.missingSkills.length > 0 || c.brokenLinks.length > 0),
  ).length;

  const totalIssues =
    missingCLIs.length +
    missingSkills.length +
    (globalWorkflows.installed ? 0 : 1) +
    (rerereEnabled ? 0 : 1) +
    symlinkIssues;

  if (jsonMode) {
    const result = {
      ok: totalIssues === 0,
      issues: totalIssues,
      clis: clis.map((c) => ({
        name: c.name,
        installed: c.installed,
        version: c.version || null,
      })),
      mcp: mcpChecks.map((c) => ({
        name: c.name,
        configured: c.mcp.configured,
        path: c.mcp.path || null,
      })),
      skills:
        skillChecks.length > 0
          ? skillChecks.map((s) => ({
              name: s.name,
              installed: s.installed,
              complete: s.hasSkillMd,
            }))
          : [],
      missingSkills: missingSkills.map((s) => s.name),
      globalWorkflows: {
        installed: globalWorkflows.installed,
        count: globalWorkflows.count,
      },
      serena: { exists: hasSerena, fileCount: serenaFileCount },
      gitRerere: { enabled: rerereEnabled },
      symlinks: symlinkChecks.map((c) => ({
        cli: c.cli,
        dir: c.skillsDir,
        exists: c.exists,
        missing: c.missingSkills,
        broken: c.brokenLinks,
      })),
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(totalIssues === 0 ? 0 : 1);
  }

  console.clear();
  p.intro(pc.bgMagenta(pc.white(" 🩺 oh-my-ag doctor ")));

  const spinner = p.spinner();

  try {
    const cliTable = [
      pc.bold("🔍 CLI Installation Status"),
      "┌─────────┬──────────┬─────────────┐",
      `│ ${pc.bold("CLI")}     │ ${pc.bold("Status")}     │ ${pc.bold("Version")}       │`,
      "├─────────┼──────────┼─────────────┤",
      ...clis.map((cli) => {
        const status = cli.installed
          ? pc.green("✅ Installed")
          : pc.red("❌ Missing");
        const version = cli.version || "-";
        return `│ ${cli.name.padEnd(7)} │ ${status.padEnd(8)} │ ${version.padEnd(11)} │`;
      }),
      "└─────────┴──────────┴─────────────┘",
    ].join("\n");

    p.note(cliTable, "CLI Status");

    if (missingCLIs.length > 0) {
      p.note(
        missingCLIs
          .map(
            (cli) => `${pc.yellow("→")} ${cli.name}: ${pc.dim(cli.installCmd)}`,
          )
          .join("\n"),
        "Install missing CLIs",
      );
    }

    if (mcpChecks.length > 0) {
      const mcpTable = [
        pc.bold("🔗 MCP Connection Status"),
        "┌─────────┬──────────┬─────────────────────┐",
        `│ ${pc.bold("CLI")}     │ ${pc.bold("MCP Config")} │ ${pc.bold("Path")}                │`,
        "├─────────┼──────────┼─────────────────────┤",
        ...mcpChecks.map((cli) => {
          const status = cli.mcp.configured
            ? pc.green("✅ Configured")
            : pc.yellow("⚠️  Not configured");
          const path = cli.mcp.path ? cli.mcp.path.split("/").pop() || "" : "-";
          return `│ ${cli.name.padEnd(7)} │ ${status.padEnd(8)} │ ${path.padEnd(19)} │`;
        }),
        "└─────────┴──────────┴─────────────────────┘",
      ].join("\n");

      p.note(mcpTable, "MCP Status");
    }

    const installedCount = skillChecks.filter((s) => s.installed).length;
    const completeCount = skillChecks.filter((s) => s.hasSkillMd).length;

    if (skillChecks.length > 0) {
      const skillTable = [
        pc.bold(
          `📦 Skills (${installedCount}/${skillChecks.length} installed, ${completeCount} complete)`,
        ),
        "┌────────────────────┬──────────┬─────────────┐",
        `│ ${pc.bold("Skill")}                │ ${pc.bold("Installed")} │ ${pc.bold("SKILL.md")}    │`,
        "├────────────────────┼──────────┼─────────────┤",
        ...skillChecks.map((skill) => {
          const installed = skill.installed ? pc.green("✅") : pc.red("❌");
          const hasMd = skill.hasSkillMd ? pc.green("✅") : pc.red("❌");
          return `│ ${skill.name.padEnd(18)} │ ${installed.padEnd(8)} │ ${hasMd.padEnd(11)} │`;
        }),
        "└────────────────────┴──────────┴─────────────┘",
      ].join("\n");

      p.note(skillTable, "Skills Status");
    } else {
      p.note(pc.yellow("No skills installed."), "Skills Status");
    }

    if (missingSkills.length > 0) {
      const shouldRepair = await p.confirm({
        message: `Found ${missingSkills.length} missing/incomplete skill(s). Install them?`,
        initialValue: true,
      });

      if (p.isCancel(shouldRepair)) {
        p.cancel("Cancelled.");
        process.exit(0);
      }

      if (shouldRepair) {
        const allSkillNames = missingSkills.map((s) => s.name);

        const selectMode = await p.select({
          message: "Which skills to install?",
          options: [
            {
              value: "all",
              label: `✨ All (${allSkillNames.length} skills)`,
              hint: "Recommended",
            },
            { value: "select", label: "🔧 Select individually" },
          ],
        });

        if (p.isCancel(selectMode)) {
          p.cancel("Cancelled.");
          process.exit(0);
        }

        let skillsToInstall: string[];

        if (selectMode === "select") {
          const allSkills = getAllSkills();
          const selected = await p.multiselect({
            message: "Select skills to install:",
            options: missingSkills.map((s) => {
              const skillInfo = allSkills.find((sk) => sk.name === s.name);
              return {
                value: s.name,
                label: s.name,
                hint: skillInfo?.desc || "",
              };
            }),
            required: true,
          });

          if (p.isCancel(selected)) {
            p.cancel("Cancelled.");
            process.exit(0);
          }
          skillsToInstall = selected as string[];
        } else {
          skillsToInstall = allSkillNames;
        }

        spinner.start("Installing skills...");

        try {
          await installShared(cwd);

          for (const skillName of skillsToInstall) {
            spinner.message(`Installing ${pc.cyan(skillName)}...`);
            await installSkill(skillName, cwd);
          }

          spinner.stop(`Installed ${skillsToInstall.length} skill(s)!`);
          p.note(
            skillsToInstall.map((s) => `${pc.green("✓")} ${s}`).join("\n"),
            "Installed Skills",
          );
        } catch (error) {
          spinner.stop("Installation failed");
          p.log.error(error instanceof Error ? error.message : String(error));
        }
      }
    }

    const activeSymlinkChecks = symlinkChecks.filter((c) => c.exists);
    if (activeSymlinkChecks.length > 0) {
      const hasIssues = activeSymlinkChecks.some(
        (c) => c.missingSkills.length > 0 || c.brokenLinks.length > 0,
      );

      if (hasIssues) {
        const issuesTable = [
          pc.bold("🔗 CLI Symlink Status"),
          "┌─────────────┬──────────────────┬───────────────────┐",
          `│ ${pc.bold("CLI")}         │ ${pc.bold("Missing")}            │ ${pc.bold("Broken")}              │`,
          "├─────────────┼──────────────────┼───────────────────┤",
          ...activeSymlinkChecks
            .filter(
              (c) => c.missingSkills.length > 0 || c.brokenLinks.length > 0,
            )
            .map((c) => {
              const missing =
                c.missingSkills.length > 0
                  ? `${c.missingSkills.length} skills`
                  : "-";
              const broken =
                c.brokenLinks.length > 0
                  ? `${c.brokenLinks.length} links`
                  : "-";
              return `│ ${c.cli.padEnd(11)} │ ${missing.padEnd(16)} │ ${broken.padEnd(17)} │`;
            }),
          "└─────────────┴──────────────────┴───────────────────┘",
        ].join("\n");

        p.note(issuesTable, "Symlink Issues");

        p.note(
          [
            pc.yellow("Run 'bunx oh-my-ag' to repair symlinks"),
            pc.dim(
              "Select the same CLI tools to recreate missing/broken links",
            ),
          ].join("\n"),
          "Repair Symlinks",
        );
      } else {
        const allOkTable = [
          pc.bold("🔗 CLI Symlink Status"),
          "┌─────────────┬──────────┐",
          `│ ${pc.bold("CLI")}         │ ${pc.bold("Status")}   │`,
          "├─────────────┼──────────┤",
          ...activeSymlinkChecks.map((c) => {
            return `│ ${c.cli.padEnd(11)} │ ${pc.green("✅ OK")}     │`;
          }),
          "└─────────────┴──────────┘",
        ].join("\n");

        p.note(allOkTable, "CLI Symlinks");
      }
    }

    if (hasSerena) {
      p.note(
        `${pc.green("✅")} Serena memory directory exists\n${pc.dim(`${serenaFileCount} memory files found`)}`,
        "Serena Memory",
      );
    } else {
      p.note(
        `${pc.yellow("⚠️")} Serena memory directory not found\n${pc.dim("Dashboard will show 'No agents detected'")}`,
        "Serena Memory",
      );
    }

    if (globalWorkflows.installed) {
      p.note(
        `${pc.green("✅")} Global workflows installed\n${pc.dim(`${globalWorkflows.count} workflow files found`)}`,
        "Global Workflows",
      );
    } else {
      p.note(
        `${pc.red("❌")} Global workflows missing\n${pc.dim("Run 'oh-my-ag' to install or reinstall global workflows")}`,
        "Global Workflows",
      );
    }

    if (rerereEnabled) {
      p.note(`${pc.green("✅")} git rerere is enabled`, "Git Config");
    } else {
      const shouldEnable = await p.confirm({
        message:
          "Enable git rerere? (Recommended for multi-agent merge conflict reuse)",
        initialValue: true,
      });

      if (!p.isCancel(shouldEnable) && shouldEnable) {
        try {
          execSync("git config --global rerere.enabled true");
          p.log.success(pc.green("git rerere enabled globally!"));
        } catch (err) {
          p.log.error(`Failed to enable git rerere: ${err}`);
        }
      } else {
        p.note(
          `${pc.yellow("⚠️")} git rerere is not enabled\n${pc.dim("Run: git config --global rerere.enabled true")}`,
          "Git Config",
        );
      }
    }

    if (totalIssues === 0) {
      p.outro(pc.green("✅ All checks passed! Ready to use."));
    } else {
      p.outro(
        pc.yellow(`⚠️  Found ${totalIssues} issue(s). See details above.`),
      );
    }

    p.note(
      `${pc.yellow("❤️")} Enjoying oh-my-ag? Give it a star or sponsor!\n${pc.dim("gh api --method PUT /user/starred/first-fluke/oh-my-ag")}\n${pc.dim("https://github.com/sponsors/first-fluke")}`,
      "Support",
    );
  } catch (error) {
    if (spinner) spinner.stop("Check failed");
    p.log.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
