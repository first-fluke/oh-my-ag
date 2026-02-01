import * as fs from "node:fs";
import { join } from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";
import {
  GITHUB_AGENT_ROOT,
  installConfigs,
  installWorkflows,
} from "../lib/skills.js";

// Mock node:fs module
vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

describe("skills.ts - Workflow and Config Installation", () => {
  const mockTargetDir = "/tmp/test-project";
  let mockFetch: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("installWorkflows", () => {
    it("should create workflows directory if it does not exist", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => "mock content",
      } as Response);

      await installWorkflows(mockTargetDir);

      const workflowsDir = join(mockTargetDir, ".agent", "workflows");
      expect(fs.existsSync).toHaveBeenCalledWith(workflowsDir);
      expect(fs.mkdirSync).toHaveBeenCalledWith(workflowsDir, {
        recursive: true,
      });
    });

    it("should fetch and write workflow files", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => "workflow content",
      } as Response);

      await installWorkflows(mockTargetDir);

      // Check if fetch was called for expected files
      const expectedFiles = [
        "coordinate.md",
        "debug.md",
        "orchestrate.md",
        "plan.md",
        "review.md",
        "setup.md",
        "tools.md",
      ];

      for (const file of expectedFiles) {
        expect(mockFetch).toHaveBeenCalledWith(
          `${GITHUB_AGENT_ROOT}/workflows/${file}`,
        );
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining(file),
          "workflow content",
          "utf-8",
        );
      }
    });

    it("should skip files if fetch fails", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockFetch.mockResolvedValue({
        ok: false, // Fetch fails
      } as Response);

      await installWorkflows(mockTargetDir);

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe("installConfigs", () => {
    it("should create config directory and install user-preferences", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      mockFetch.mockImplementation(async (url) => {
        if (url.toString().includes("user-preferences.yaml")) {
          return {
            ok: true,
            text: async () => "preferences content",
          } as Response;
        }
        return { ok: false } as Response;
      });

      await installConfigs(mockTargetDir);

      const configDir = join(mockTargetDir, ".agent", "config");
      expect(fs.existsSync).toHaveBeenCalledWith(configDir);
      expect(fs.mkdirSync).toHaveBeenCalledWith(configDir, { recursive: true });

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        join(configDir, "user-preferences.yaml"),
        "preferences content",
        "utf-8",
      );
    });

    it("should install mcp.json", async () => {
      mockFetch.mockImplementation(async (url) => {
        if (url.toString().includes("mcp.json")) {
          return {
            ok: true,
            text: async () => "mcp content",
          } as Response;
        }
        return { ok: false } as Response;
      });

      await installConfigs(mockTargetDir);

      const agentDir = join(mockTargetDir, ".agent");
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        join(agentDir, "mcp.json"),
        "mcp content",
        "utf-8",
      );
    });
  });
});
