#!/usr/bin/env bun
/**
 * oh-my-agent — Serena Primer Hook (backwards compatibility wrapper)
 *
 * Delegates to code-intelligence-primer.ts.
 */

export * from "./code-intelligence-primer.ts";

import { runStandAlone } from "./code-intelligence-primer.ts";

if (import.meta.main) {
  runStandAlone().catch(() => process.exit(0));
}
