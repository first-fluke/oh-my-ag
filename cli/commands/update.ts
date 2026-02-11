import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";
import pMap from "p-map";
import pc from "picocolors";
import {
  downloadFile,
  fetchRemoteManifest,
  getLocalVersion,
  saveLocalVersion,
} from "../lib/manifest.js";
import {
  CLI_SKILLS_DIR,
  type CliTool,
  createCliSymlinks,
} from "../lib/skills.js";

export async function update(): Promise<void> {
  console.clear();
  p.intro(pc.bgMagenta(pc.white(" 🛸 oh-my-ag update ")));

  const cwd = process.cwd();
  const spinner = p.spinner();

  try {
    spinner.start("Checking for updates...");

    const remoteManifest = await fetchRemoteManifest();
    const localVersion = await getLocalVersion(cwd);

    if (localVersion === remoteManifest.version) {
      spinner.stop(pc.green("Already up to date!"));
      p.outro(`Current version: ${pc.cyan(localVersion)}`);
      return;
    }

    spinner.message(
      `Updating from ${localVersion || "not installed"} to ${pc.cyan(remoteManifest.version)}...`,
    );

    const results = await pMap(
      remoteManifest.files,
      async (file) => downloadFile(file),
      { concurrency: 10 },
    );

    const failures = results.filter((r) => !r.success);

    if (failures.length > 0) {
      spinner.stop("Update completed with errors");
      p.note(
        failures.map((f) => `${pc.red("✗")} ${f.path}: ${f.error}`).join("\n"),
        `${failures.length} files failed`,
      );
    } else {
      spinner.stop(`Updated to version ${pc.cyan(remoteManifest.version)}!`);
    }

    await saveLocalVersion(cwd, remoteManifest.version);

    const ssotSkillsDir = join(cwd, ".agent", "skills");
    const activeClis: CliTool[] = [];

    for (const [cli, skillsDir] of Object.entries(CLI_SKILLS_DIR)) {
      const cliSkillsDir = join(cwd, skillsDir);
      if (existsSync(cliSkillsDir)) {
        activeClis.push(cli as CliTool);
      }
    }

    let symlinkCreated: string[] = [];
    let symlinkSkipped: string[] = [];

    if (activeClis.length > 0 && existsSync(ssotSkillsDir)) {
      spinner.message("Updating CLI symlinks...");

      const installedSkills = readdirSync(ssotSkillsDir).filter(
        (name) => name !== "_shared" && existsSync(join(ssotSkillsDir, name)),
      );

      const { created, skipped } = createCliSymlinks(
        cwd,
        activeClis,
        installedSkills,
      );
      symlinkCreated = created;
      symlinkSkipped = skipped;
    }

    const successCount = results.length - failures.length;

    if (symlinkCreated.length > 0 || symlinkSkipped.length > 0) {
      p.note(
        [
          `${pc.green("✓")} ${successCount} files updated`,
          ...(symlinkCreated.length > 0
            ? [
                "",
                pc.cyan("Symlinks created:"),
                ...symlinkCreated.map((s) => `${pc.green("→")} ${s}`),
              ]
            : []),
          ...(symlinkSkipped.length > 0
            ? [
                "",
                pc.dim("Symlinks skipped:"),
                ...symlinkSkipped.map((s) => pc.dim(`  ${s}`)),
              ]
            : []),
        ].join("\n"),
        "Update Complete",
      );
    }

    p.outro(
      failures.length > 0
        ? `${successCount} files updated, ${failures.length} failed`
        : `${successCount} files updated successfully`,
    );
  } catch (error) {
    spinner.stop("Update failed");
    p.log.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
