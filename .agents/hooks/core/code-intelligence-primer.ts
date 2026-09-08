#!/usr/bin/env bun
/**
 * oh-my-agent — Code Intelligence Primer Hook (prompt kind)
 *
 * Works with: Claude Code, Codex CLI, Cursor, Qwen Code,
 * Antigravity, Grok, Kiro.
 *
 * Injects a short, vendor-neutral reminder ONCE per session so the selected
 * code-intelligence provider (Serena or Gortex) tools are loaded and preferred.
 *
 * Gating:
 *   - Only fires when a code-intelligence provider is configured:
 *     - "gortex" via providers.code_intelligence in oma-config.yaml
 *     - "serena" via providers.code_intelligence or .serena/project.yml
 *   - Only fires once per session (state file under .agents/state/).
 *
 * Runs on the vendor's prompt event (UserPromptSubmit / BeforeAgent /
 * PreInvocation / beforeSubmitPrompt / userPromptSubmit), after skill-injector.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { agyConversationId, isAgyInput, readAgyPrompt } from "./agy-input.ts";
import { makePromptOutput } from "./hook-output.ts";
import { normalizePromptInput } from "./prompt-input.ts";
import type { HandlerCtx, HandlerResult, HookInput, Vendor } from "./types.ts";
import { getProjectDir, inferVendorFromScriptPath } from "./vendor-detect.ts";

const SESSION_TTL_MS = 60 * 60 * 1000;

export type CodeIntelligenceProvider = "serena" | "gortex";

// ── Provider Detection ────────────────────────────────────────

function readCodeIntelligenceFromYaml(
  content: string,
): CodeIntelligenceProvider | null {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((l) => /^providers:\s*(#.*)?$/.test(l));
  if (start === -1) return null;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (/^\s*(#|$)/.test(line)) continue;
    if (!/^\s/.test(line)) break;
    const match = line.match(/^\s+code_intelligence:\s*(\S.*)$/)?.[1];
    if (match) {
      const val = match.replace(/#.*$/, "").trim().toLowerCase();
      if (val === "gortex" || val === "serena") return val;
    }
  }
  return null;
}

/**
 * Resolves the selected code-intelligence provider.
 * Looks in oma-config.local.yaml, oma-config.yaml, and falls back to
 * detecting .serena/project.yml.
 */
export function detectCodeIntelligenceProvider(
  projectDir: string,
): CodeIntelligenceProvider | null {
  for (const rel of [
    join(".agents", "oma-config.local.yaml"),
    join(".agents", "oma-config.yaml"),
  ]) {
    const p = join(projectDir, rel);
    if (existsSync(p)) {
      try {
        const val = readCodeIntelligenceFromYaml(readFileSync(p, "utf-8"));
        if (val) return val;
      } catch {
        // fall open
      }
    }
  }
  if (existsSync(join(projectDir, ".serena", "project.yml"))) {
    return "serena";
  }
  return null;
}

/**
 * Backward-compatible helper: true when Serena is the active provider.
 */
export function isSerenaProject(projectDir: string): boolean {
  return detectCodeIntelligenceProvider(projectDir) === "serena";
}

// ── Session-once State ────────────────────────────────────────

interface PrimerState {
  sessions: Record<string, number>;
}

function getStatePath(projectDir: string): string {
  const newPath = join(
    projectDir,
    ".agents",
    "state",
    "code-intelligence-primer.json",
  );
  if (existsSync(newPath)) return newPath;
  const legacyPath = join(projectDir, ".agents", "state", "serena-primer.json");
  if (existsSync(legacyPath)) return legacyPath;
  return newPath;
}

function readState(projectDir: string): PrimerState {
  const p = getStatePath(projectDir);
  if (!existsSync(p)) return { sessions: {} };
  try {
    const parsed = JSON.parse(readFileSync(p, "utf-8"));
    if (parsed && typeof parsed === "object" && parsed.sessions) {
      return parsed as PrimerState;
    }
  } catch {
    // corrupted — reset
  }
  return { sessions: {} };
}

function writeState(projectDir: string, state: PrimerState): void {
  const p = getStatePath(projectDir);
  try {
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, JSON.stringify(state, null, 2));
  } catch {
    // failing open is acceptable — worst case the primer injects again
  }
}

/**
 * Returns true and records the session when this is the first prompt of the
 * session (within TTL); returns false on subsequent prompts. Expired sessions
 * are pruned. Pure given `now` for testability.
 */
export function claimSession(
  projectDir: string,
  sessionId: string,
  now: number = Date.now(),
): boolean {
  const state = readState(projectDir);

  for (const [id, ts] of Object.entries(state.sessions)) {
    if (now - ts > SESSION_TTL_MS) delete state.sessions[id];
  }

  const last = state.sessions[sessionId];
  if (last !== undefined && now - last <= SESSION_TTL_MS) {
    return false;
  }

  state.sessions[sessionId] = now;
  writeState(projectDir, state);
  return true;
}

// ── Primer Content ────────────────────────────────────────────

/**
 * Vendor-neutral code intelligence priming context. Kept short — it is
 * injected once per session as advisory guidance, not a per-turn reminder.
 */
export function primerContext(
  provider: CodeIntelligenceProvider = "serena",
): string {
  if (provider === "gortex") {
    return [
      "[OMA GORTEX PRIMER]",
      "For code work, use Gortex MCP tools for code search, navigation, impact, contracts and edits.",
      "Load deferred tools before use. If Gortex is unavailable or times out, use native tools.",
    ].join("\n");
  }
  return [
    "[OMA SERENA PRIMER]",
    "For code work, load deferred Serena tools if needed and read `initial_instructions` once unless already provided.",
    "Omit `max_answer_chars`; narrow the query if results exceed the limit.",
    "If Serena is unavailable or times out, use native tools. Do not retry timed-out MCP calls this session.",
  ].join("\n");
}

// ── Pure handler (canonical ABI) ─────────────────────────────

/**
 * Pure decision function — injects the code intelligence primer on the first
 * prompt of an activated project's session, else returns null.
 * `ctx.cwd` must be the resolved git-root project directory.
 */
export async function run(
  input: HookInput,
  ctx: HandlerCtx,
): Promise<HandlerResult | null> {
  if (input.kind !== "prompt") return null;

  const { cwd: projectDir, sid: sessionId = "unknown" } = ctx;

  const provider = detectCodeIntelligenceProvider(projectDir);
  if (!provider) return null;

  // Compaction keeps the session id, so the session-once claim would skip
  // exactly the turn that just lost the primer from context — force re-inject.
  const forced = input.source === "compact";
  if (!claimSession(projectDir, sessionId) && !forced) return null;

  return { type: "context", additionalContext: primerContext(provider) };
}

// ── Standalone entry (pi subprocess / direct bun invocation) ──

function detectVendor(input: Record<string, unknown>): Vendor {
  const byScriptPath = inferVendorFromScriptPath(import.meta.filename);
  if (byScriptPath) return byScriptPath;
  if (isAgyInput(input)) return "antigravity";
  const event = input.hook_event_name as string | undefined;
  const hookEventName = input.hookEventName as string | undefined;
  if (process.env.GROK_WORKSPACE_ROOT) return "grok";
  if (
    process.env.KIRO_PROJECT_DIR ||
    event === "userPromptSubmit" ||
    hookEventName === "userPromptSubmit"
  ) {
    return "kiro";
  }
  if (event === "PreInvocation") return "antigravity";
  if (event === "beforeSubmitPrompt") return "cursor";
  if (
    event === "UserPromptSubmit" &&
    "session_id" in input &&
    !("sessionId" in input)
  )
    return "codex";
  if (process.env.QWEN_PROJECT_DIR) return "qwen";
  return "claude";
}

function getSessionId(input: Record<string, unknown>): string {
  return (
    (input.sessionId as string) ||
    (input.session_id as string) ||
    agyConversationId(input) ||
    "unknown"
  );
}

export async function runStandAlone() {
  const raw = readFileSync(0, "utf-8");
  let input: Record<string, unknown>;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const vendor = detectVendor(input);
  const projectDir = getProjectDir(vendor, input);
  const sessionId = getSessionId(input);
  let prompt = normalizePromptInput(input.prompt);

  // agy's PreInvocation stdin carries no `prompt`; recover it and only act on
  // the first invocation of a turn.
  if (vendor === "antigravity" && !prompt) {
    const invocationNum = input.invocationNum;
    if (typeof invocationNum === "number" && invocationNum > 1) process.exit(0);
    prompt = readAgyPrompt(input.transcriptPath);
  }

  const hookInput: HookInput = { kind: "prompt", prompt, cwd: projectDir };
  const ctx: HandlerCtx = { vendor, cwd: projectDir, sid: sessionId };

  const result = await run(hookInput, ctx);
  if (result && result.type === "context") {
    process.stdout.write(makePromptOutput(vendor, result.additionalContext));
  }
  process.exit(0);
}

if (import.meta.main) {
  runStandAlone().catch(() => process.exit(0));
}
