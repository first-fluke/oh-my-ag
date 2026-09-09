export const CODEX_AUTO_APPROVE_FLAG =
  "--dangerously-bypass-approvals-and-sandbox";

const LEGACY_CODEX_AUTO_APPROVE_FLAG = "--full-auto";

/**
 * Codex 0.153 removed --full-auto. Normalize shipped legacy configuration so
 * already-installed projects keep working without editing their managed files.
 */
export function resolveCodexAutoApproveFlag(configured?: string): string {
  return !configured || configured === LEGACY_CODEX_AUTO_APPROVE_FLAG
    ? CODEX_AUTO_APPROVE_FLAG
    : configured;
}
