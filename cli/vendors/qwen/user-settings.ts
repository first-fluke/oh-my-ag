import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { isRecord } from "../../utils/type-guards.js";

/**
 * Whether the user-level `~/.qwen/settings.json` defines `modelProviders`.
 *
 * Qwen Code seals provider model entries: a project-level top-level
 * `model.generationConfig.timeout` is ignored for them and triggers a startup
 * warning, so callers pass this to `applyQwenSettings` as
 * `userModelProviders`. Unreadable or unparsable files count as absent.
 */
export function hasUserQwenModelProviders(home: string = homedir()): boolean {
  const settingsPath = join(home, ".qwen", "settings.json");
  if (!existsSync(settingsPath)) return false;
  try {
    const parsed: unknown = JSON.parse(readFileSync(settingsPath, "utf-8"));
    return (
      isRecord(parsed) &&
      isRecord(parsed.modelProviders) &&
      Object.keys(parsed.modelProviders).length > 0
    );
  } catch {
    return false;
  }
}
