import pMap from "p-map";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { update } from "../commands/update.js";
import * as manifest from "../lib/manifest.js";
import * as skills from "../lib/skills.js";
import type { ManifestFile } from "../types/index.js";

vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  spinner: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    message: vi.fn(),
  }),
  outro: vi.fn(),
  note: vi.fn(),
  log: {
    error: vi.fn(),
  },
}));

vi.mock("../lib/manifest.js", () => ({
  fetchRemoteManifest: vi.fn(),
  getLocalVersion: vi.fn(),
  saveLocalVersion: vi.fn(),
  downloadFile: vi.fn(),
}));

vi.mock("p-map", () => ({
  default: vi.fn(),
}));

describe("update command", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "clear").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should exit early if versions match", async () => {
    vi.mocked(manifest.fetchRemoteManifest).mockResolvedValue({
      version: "1.0.0",
      files: [],
      name: "test",
      releaseDate: "2025-01-01",
      repository: "test/repo",
    });
    vi.mocked(manifest.getLocalVersion).mockResolvedValue("1.0.0");

    await update();

    expect(manifest.downloadFile).not.toHaveBeenCalled();
  });

  it("should process updates if versions differ", async () => {
    const manifestFiles: ManifestFile[] = [
      { path: "file1", sha256: "hash", size: 100 },
    ];
    vi.mocked(manifest.fetchRemoteManifest).mockResolvedValue({
      version: "2.0.0",
      files: manifestFiles,
      name: "test",
      releaseDate: "2025-01-01",
      repository: "test/repo",
    });
    vi.mocked(manifest.getLocalVersion).mockResolvedValue("1.0.0");
    vi.mocked(pMap).mockResolvedValue([{ success: true, path: "file1" }]);

    await update();

    expect(pMap).toHaveBeenCalled();
    expect(manifest.saveLocalVersion).toHaveBeenCalledWith(
      expect.anything(),
      "2.0.0",
    );
  });

  it("should handle download errors", async () => {
    const manifestFiles: ManifestFile[] = [
      { path: "file1", sha256: "hash", size: 100 },
    ];
    vi.mocked(manifest.fetchRemoteManifest).mockResolvedValue({
      version: "2.0.0",
      files: manifestFiles,
      name: "test",
      releaseDate: "2025-01-01",
      repository: "test/repo",
    });
    vi.mocked(manifest.getLocalVersion).mockResolvedValue("1.0.0");
    vi.mocked(pMap).mockResolvedValue([
      { success: false, path: "file1", error: "failed" },
    ]);

    await update();

    expect(manifest.saveLocalVersion).toHaveBeenCalledWith(
      expect.anything(),
      "2.0.0",
    );
  });
});

describe("whitelist-based skill filtering", () => {
  it("getAllSkills should return only registered skills", () => {
    const allSkills = skills.getAllSkills();
    const skillNames = allSkills.map((s) => s.name);

    expect(skillNames).toContain("frontend-agent");
    expect(skillNames).toContain("backend-agent");
    expect(skillNames).toContain("pm-agent");
    expect(skillNames).toContain("commit");

    expect(skillNames).not.toContain(".DS_Store");
    expect(skillNames).not.toContain("_version.json");
    expect(skillNames).not.toContain("_shared");
    expect(skillNames).not.toContain("my-custom-skill");
  });

  it("SKILLS registry should not contain internal files or hidden files", () => {
    const allSkills = skills.getAllSkills();

    for (const skill of allSkills) {
      expect(skill.name).not.toMatch(/^\./);
      expect(skill.name).not.toMatch(/^_/);
      expect(skill.name).not.toMatch(/\.json$/);
    }
  });

  it("getAllSkills should include all domain, coordination, and utility skills", () => {
    const allSkills = skills.getAllSkills();
    const skillNames = allSkills.map((s) => s.name);

    const expectedSkills = [
      "frontend-agent",
      "backend-agent",
      "mobile-agent",
      "pm-agent",
      "qa-agent",
      "workflow-guide",
      "orchestrator",
      "debug-agent",
      "commit",
    ];

    for (const expected of expectedSkills) {
      expect(skillNames).toContain(expected);
    }
  });
});
