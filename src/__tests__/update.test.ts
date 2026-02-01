import pMap from "p-map";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { update } from "../commands/update.js";
import * as manifest from "../lib/manifest.js";
import type { ManifestFile } from "../types/index.js";

// Mocks
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
