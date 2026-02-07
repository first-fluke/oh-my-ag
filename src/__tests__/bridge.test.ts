import * as child_process from "node:child_process";
import type * as http from "node:http";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";
import { bridge, validateSerenaConfigs } from "../commands/bridge.js";

// Mock fs module
const mockFs = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return {
    ...actual,
    existsSync: mockFs.existsSync,
    readFileSync: mockFs.readFileSync,
    writeFileSync: mockFs.writeFileSync,
  };
});

// Mock os module
const mockOs = vi.hoisted(() => ({
  homedir: vi.fn(() => "/mock/home"),
}));

vi.mock("node:os", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:os")>();
  return {
    ...actual,
    homedir: mockOs.homedir,
  };
});

// Define types for our mocks to avoid 'any'
interface MockRequest {
  on: MockInstance;
  end: MockInstance;
  destroy: MockInstance;
  write: MockInstance;
}

interface MockProcess {
  stderr: { on: MockInstance };
  on: MockInstance;
  kill: MockInstance;
  stdout: { write: MockInstance; on: MockInstance };
  stdin: {
    setEncoding: MockInstance;
    on: MockInstance;
    resume: MockInstance;
  };
}

// Mocks
vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

// Mock http and https using hoisted var
const mockHttp = vi.hoisted(() => ({
  get: vi.fn(),
  request: vi.fn(),
}));

vi.mock("node:http", async () => {
  return {
    default: mockHttp, // For default import
    ...mockHttp, // For named imports
  };
});

vi.mock("node:https", async () => {
  return {
    default: mockHttp,
    ...mockHttp,
  };
});

describe("bridge command", () => {
  let mockProcess: MockProcess;
  let mockReq: MockRequest;
  let consoleErrorSpy: MockInstance;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _processExitSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockProcess = {
      stderr: { on: vi.fn() },
      on: vi.fn(),
      kill: vi.fn(),
      stdout: { write: vi.fn(), on: vi.fn() },
      stdin: {
        setEncoding: vi.fn(),
        on: vi.fn(),
        resume: vi.fn(),
      },
    };
    vi.mocked(child_process.spawn).mockReturnValue(
      mockProcess as unknown as child_process.ChildProcess,
    );

    mockReq = {
      on: vi.fn(),
      end: vi.fn(),
      destroy: vi.fn(),
      write: vi.fn(),
    };

    // Default implementation for get/request
    mockHttp.get.mockImplementation(
      (_url: string | URL, cb?: (res: http.IncomingMessage) => void) => {
        // Use setImmediate to allow loop to progress if needed, or synchronous if consistent with logic
        if (cb) {
          cb({} as http.IncomingMessage);
        }
        return mockReq;
      },
    );
    mockHttp.request.mockImplementation(() => mockReq);

    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    _processExitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(
        (_code?: string | number | null | undefined): never => {
          throw new Error("Process exited");
        },
      );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should start server if checkServer fails initially", async () => {
    let callCount = 0;

    // Override get implementation for this test
    mockHttp.get.mockImplementation(
      (_url: string | URL, cb?: (res: http.IncomingMessage) => void) => {
        callCount++;
        const req = {
          on: (event: string, handler: (err?: Error) => void) => {
            if (event === "error" && callCount === 1) {
              handler(new Error("fail"));
            }
          },
          end: vi.fn(),
          destroy: vi.fn(),
          write: vi.fn(),
        };

        // If succeeding (callCount > 1), invoke callback
        if (callCount > 1 && cb) {
          cb({} as http.IncomingMessage);
        }
        return req;
      },
    );

    // Run bridge
    const _bridgePromise = bridge();

    // 1. Initial checkServer fails (callCount 1) -> triggers error handler immediately via mock above
    // 2. startServer called
    // 3. spawn called
    // 4. Loop starts waiting for server

    // Advance timers to process async loops
    await vi.advanceTimersByTimeAsync(2000);

    expect(child_process.spawn).toHaveBeenCalledWith(
      "uvx",
      expect.arrayContaining(["serena-mcp-server"]),
      expect.anything(),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Starting Serena server"),
    );
  });

  it("should connect to existing server without starting new one", async () => {
    // Override get implementation for this test
    mockHttp.get.mockImplementation(
      (_url: string | URL, cb?: (res: http.IncomingMessage) => void) => {
        if (cb) cb({} as http.IncomingMessage);
        return {
          on: vi.fn(),
          end: vi.fn(),
          destroy: vi.fn(),
          write: vi.fn(),
        };
      },
    );

    const _bridgePromise = bridge();
    await vi.advanceTimersByTimeAsync(100);

    expect(child_process.spawn).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Connected to existing Serena server"),
    );
  });
});

describe("validateSerenaConfigs", () => {
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should do nothing if global config does not exist", () => {
    mockFs.existsSync.mockReturnValue(false);

    validateSerenaConfigs();

    expect(mockFs.readFileSync).not.toHaveBeenCalled();
    expect(mockFs.writeFileSync).not.toHaveBeenCalled();
  });

  it("should do nothing if no projects are registered", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue("some_key: value\n");

    validateSerenaConfigs();

    expect(mockFs.writeFileSync).not.toHaveBeenCalled();
  });

  it("should skip projects without project.yml", () => {
    mockFs.existsSync.mockImplementation((path: string) => {
      if (path === "/mock/home/.serena/serena_config.yml") return true;
      if (path === "/project1/.serena/project.yml") return false;
      return false;
    });
    mockFs.readFileSync.mockReturnValue("projects:\n  - /project1\n");

    validateSerenaConfigs();

    expect(mockFs.writeFileSync).not.toHaveBeenCalled();
  });

  it("should not modify project.yml if languages key already exists", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockImplementation((path: string) => {
      if (path === "/mock/home/.serena/serena_config.yml") {
        return "projects:\n  - /project1\n";
      }
      if (path === "/project1/.serena/project.yml") {
        return "project:\n  name: test\n\nlanguages:\n  - python\n";
      }
      return "";
    });

    validateSerenaConfigs();

    expect(mockFs.writeFileSync).not.toHaveBeenCalled();
  });

  it("should add languages key if missing from project.yml", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockImplementation((path: string) => {
      if (path === "/mock/home/.serena/serena_config.yml") {
        return "projects:\n  - /project1\n";
      }
      if (path === "/project1/.serena/project.yml") {
        return "project:\n  name: test\n\nstructure:\n  monorepo: true\n";
      }
      return "";
    });

    validateSerenaConfigs();

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      "/project1/.serena/project.yml",
      expect.stringContaining("languages:"),
    );
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      "/project1/.serena/project.yml",
      expect.stringContaining("- python"),
    );
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      "/project1/.serena/project.yml",
      expect.stringContaining("- typescript"),
    );
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      "/project1/.serena/project.yml",
      expect.stringContaining("- dart"),
    );
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      "/project1/.serena/project.yml",
      expect.stringContaining("- terraform"),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Missing 'languages' key"),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Fixed"),
    );
  });

  it("should handle multiple projects", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockImplementation((path: string) => {
      if (path === "/mock/home/.serena/serena_config.yml") {
        return "projects:\n  - /project1\n  - /project2\n";
      }
      if (path === "/project1/.serena/project.yml") {
        return "project:\n  name: test1\n\nlanguages:\n  - python\n";
      }
      if (path === "/project2/.serena/project.yml") {
        return "project:\n  name: test2\n\nstructure:\n  monorepo: true\n";
      }
      return "";
    });

    validateSerenaConfigs();

    expect(mockFs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      "/project2/.serena/project.yml",
      expect.stringContaining("languages:"),
    );
  });

  it("should handle errors gracefully", () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error("Read error");
    });

    validateSerenaConfigs();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to validate Serena configs"),
    );
    expect(mockFs.writeFileSync).not.toHaveBeenCalled();
  });
});
