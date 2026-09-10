import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hasUserQwenModelProviders } from "./user-settings.js";

let home: string;

function writeUserSettings(content: string): void {
  mkdirSync(join(home, ".qwen"), { recursive: true });
  writeFileSync(join(home, ".qwen", "settings.json"), content);
}

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), "oma-qwen-home-"));
});

afterEach(() => {
  rmSync(home, { recursive: true, force: true });
});

describe("hasUserQwenModelProviders", () => {
  it("is false when the user settings file does not exist", () => {
    expect(hasUserQwenModelProviders(home)).toBe(false);
  });

  it("is true when user settings define modelProviders", () => {
    writeUserSettings(
      JSON.stringify({
        modelProviders: { openai: [{ id: "Qwen/Qwen3.8-27B" }] },
      }),
    );
    expect(hasUserQwenModelProviders(home)).toBe(true);
  });

  it("is false when modelProviders is missing or empty", () => {
    writeUserSettings(JSON.stringify({ model: { name: "qwen3-coder-plus" } }));
    expect(hasUserQwenModelProviders(home)).toBe(false);

    writeUserSettings(JSON.stringify({ modelProviders: {} }));
    expect(hasUserQwenModelProviders(home)).toBe(false);
  });

  it("is false when the user settings file is not valid JSON", () => {
    writeUserSettings("{ // comments are not JSON\n}");
    expect(hasUserQwenModelProviders(home)).toBe(false);
  });
});
