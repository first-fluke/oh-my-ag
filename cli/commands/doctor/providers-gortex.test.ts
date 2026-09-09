import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";

const probe = vi.hoisted(() => ({
  checkCLI: vi.fn(async () => ({
    name: "gortex",
    installed: true,
    version: "gortex v0.64.1",
    installCmd: "Install Gortex separately",
  })),
}));

vi.mock("./environment-checks.js", () => ({ checkCLI: probe.checkCLI }));

import { collectProviderCheck } from "./providers.js";

let root: string | undefined;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = undefined;
  vi.clearAllMocks();
});

it("probes Gortex with its version subcommand", async () => {
  root = mkdtempSync(join(tmpdir(), "oma-doctor-gortex-"));
  mkdirSync(join(root, ".agents"), { recursive: true });
  writeFileSync(
    join(root, ".agents", "oma-config.yaml"),
    "providers:\n  code_intelligence: gortex\n",
  );

  const report = await collectProviderCheck(root, {
    provider: "agentmemory",
    reachable: true,
  });

  expect(probe.checkCLI).toHaveBeenCalledWith(
    "gortex",
    "gortex",
    expect.stringContaining("Install Gortex separately"),
    ["version"],
  );
  expect(report.codeIntelligence.binaryAvailable).toBe(true);
});
