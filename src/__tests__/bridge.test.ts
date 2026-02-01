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
import { bridge } from "../commands/bridge.js";

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
  stdout: { write: MockInstance };
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
      stdout: { write: vi.fn() },
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
