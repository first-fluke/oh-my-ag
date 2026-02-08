import * as child_process from "node:child_process";
import type * as fs from "node:fs";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";
import { checkStatus, spawnAgent } from "../commands/agent.js";

// Hoist mocks to allow usage in vi.mock
const mockFsFunctions = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
  openSync: vi.fn(),
  statSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
}));

vi.mock("node:fs", async () => {
  return {
    default: mockFsFunctions,
    ...mockFsFunctions,
  };
});

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
  execSync: vi.fn(),
}));

describe("agent command", () => {
  let processKillSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock process.kill globally
    processKillSpy = vi.spyOn(process, "kill").mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("spawnAgent", () => {
    it("should exit if spawn returns no pid", async () => {
      mockFsFunctions.existsSync.mockImplementation((pathArg: fs.PathLike) => {
        const target = pathArg.toString();
        if (target === "/tmp") return true;
        return false;
      });
      mockFsFunctions.statSync.mockImplementation((pathArg: fs.PathLike) => {
        const target = pathArg.toString();
        if (target === "/tmp")
          return { isDirectory: () => true, isFile: () => false };
        return { isDirectory: () => false, isFile: () => false };
      });
      mockFsFunctions.openSync.mockReturnValue(123);

      const mockChild = { pid: undefined, on: vi.fn(), unref: vi.fn() };
      vi.mocked(child_process.spawn).mockReturnValue(
        mockChild as unknown as child_process.ChildProcess,
      );

      const exitSpy = vi
        .spyOn(process, "exit")
        .mockImplementation(
          (_code?: string | number | null | undefined): never => {
            throw new Error("exit");
          },
        );

      await expect(
        spawnAgent("agent1", "prompt.md", "session1", "/tmp"),
      ).rejects.toThrow("exit");
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it("should spawn process and write PID", async () => {
      mockFsFunctions.existsSync.mockImplementation((pathArg: fs.PathLike) => {
        const target = pathArg.toString();
        if (target.includes("user-preferences.yaml")) return false;
        if (target.includes("cli-config.yaml")) return false;
        if (target.includes("prompt.md")) return true;
        if (target === "/tmp") return true;
        return false;
      });
      mockFsFunctions.statSync.mockImplementation((pathArg: fs.PathLike) => {
        const target = pathArg.toString();
        if (target.includes("prompt.md"))
          return { isDirectory: () => false, isFile: () => true };
        if (target === "/tmp")
          return { isDirectory: () => true, isFile: () => false };
        return { isDirectory: () => false, isFile: () => false };
      });
      mockFsFunctions.readFileSync.mockImplementation(
        (pathArg: fs.PathLike) => {
          const target = pathArg.toString();
          if (target.includes("prompt.md")) return "prompt content";
          return "";
        },
      );
      mockFsFunctions.openSync.mockReturnValue(123);

      const mockChild = {
        pid: 12345,
        on: vi.fn(),
        unref: vi.fn(),
      };
      vi.mocked(child_process.spawn).mockReturnValue(
        mockChild as unknown as child_process.ChildProcess,
      );

      await spawnAgent("agent1", "prompt.md", "session1", "/tmp");

      expect(child_process.spawn).toHaveBeenCalledWith(
        "gemini",
        expect.arrayContaining(["-p", "prompt content"]),
        expect.objectContaining({ cwd: expect.stringContaining("/tmp") }),
      );
      expect(mockFsFunctions.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(".pid"),
        "12345",
      );
    });
  });

  describe("checkStatus", () => {
    it("should report correct status from result file", async () => {
      mockFsFunctions.existsSync.mockImplementation((pathArg: fs.PathLike) =>
        pathArg.toString().includes("result-"),
      );
      mockFsFunctions.readFileSync.mockReturnValue(
        "## Status: completed\nSome detail",
      );

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await checkStatus("session1", ["agent1"]);

      expect(consoleSpy).toHaveBeenCalledWith("agent1:completed");
    });

    it("should fallback to PID check if result file missing", async () => {
      mockFsFunctions.existsSync.mockImplementation((pathArg: fs.PathLike) =>
        pathArg.toString().includes(".pid"),
      );
      mockFsFunctions.readFileSync.mockReturnValue("9999");

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await checkStatus("session1", ["agent1"]);

      // Verify process.kill was called
      expect(processKillSpy).toHaveBeenCalledWith(9999, 0);
      expect(consoleSpy).toHaveBeenCalledWith("agent1:running");
    });

    it("should report crashed if PID not running", async () => {
      mockFsFunctions.existsSync.mockImplementation((pathArg: fs.PathLike) =>
        pathArg.toString().includes(".pid"),
      );
      mockFsFunctions.readFileSync.mockReturnValue("8888");

      // Mock process.kill to throw (process not running)
      processKillSpy.mockImplementation(() => {
        throw new Error("Not running");
      });

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await checkStatus("session1", ["agent1"]);

      expect(processKillSpy).toHaveBeenCalledWith(8888, 0);
      expect(consoleSpy).toHaveBeenCalledWith("agent1:crashed");
    });
  });
});
