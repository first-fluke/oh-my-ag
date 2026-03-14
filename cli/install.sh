#!/usr/bin/env bash
# oh-my-agent installer
# Usage: curl -fsSL https://raw.githubusercontent.com/first-fluke/oh-my-agent/main/cli/install.sh | bash
set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────────
if [ -t 1 ]; then
  BOLD="\033[1m"
  DIM="\033[2m"
  GREEN="\033[32m"
  YELLOW="\033[33m"
  RED="\033[31m"
  CYAN="\033[36m"
  MAGENTA="\033[35m"
  RESET="\033[0m"
else
  BOLD="" DIM="" GREEN="" YELLOW="" RED="" CYAN="" MAGENTA="" RESET=""
fi

info()  { printf "${CYAN}▸${RESET} %s\n" "$*"; }
ok()    { printf "${GREEN}✓${RESET} %s\n" "$*"; }
warn()  { printf "${YELLOW}!${RESET} %s\n" "$*"; }
fail()  { printf "${RED}✗${RESET} %s\n" "$*" >&2; exit 1; }

# ── Platform detection ──────────────────────────────────────────────
detect_platform() {
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  case "$OS" in
    Darwin) PLATFORM="macOS" ;;
    Linux)  PLATFORM="Linux" ;;
    *)      fail "Unsupported OS: $OS" ;;
  esac

  case "$ARCH" in
    x86_64|amd64)  ARCH="x64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *)             fail "Unsupported architecture: $ARCH" ;;
  esac
}

# ── Dependency checks & installs ────────────────────────────────────
check_bun() {
  if command -v bun &>/dev/null; then
    ok "bun $(bun --version) found"
    return 0
  fi
  return 1
}

install_bun() {
  info "Installing bun..."
  curl -fsSL https://bun.sh/install | bash
  # Source the updated shell profile to pick up bun
  export BUN_INSTALL="${HOME}/.bun"
  export PATH="${BUN_INSTALL}/bin:${PATH}"
  if command -v bun &>/dev/null; then
    ok "bun $(bun --version) installed"
  else
    fail "bun installation failed. Please install manually: https://bun.sh"
  fi
}

check_uv() {
  if command -v uv &>/dev/null; then
    ok "uv $(uv --version 2>/dev/null | head -1) found"
    return 0
  fi
  return 1
}

install_uv() {
  info "Installing uv..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  # Source the updated shell profile to pick up uv
  export PATH="${HOME}/.local/bin:${PATH}"
  if command -v uv &>/dev/null; then
    ok "uv $(uv --version 2>/dev/null | head -1) installed"
  else
    fail "uv installation failed. Please install manually: https://docs.astral.sh/uv"
  fi
}

# ── Main ────────────────────────────────────────────────────────────
main() {
  printf "\n${BOLD}${MAGENTA} 🛸 oh-my-agent installer ${RESET}\n\n"

  detect_platform
  info "Detected ${BOLD}${PLATFORM} ${ARCH}${RESET}"
  echo ""

  # ── bun (required) ──
  if ! check_bun; then
    install_bun
  fi

  # ── uv (required for Serena MCP) ──
  if ! check_uv; then
    install_uv
  fi

  echo ""
  ok "All dependencies ready"
  echo ""

  # ── Run oh-my-agent interactive installer ──
  info "Launching ${BOLD}oh-my-agent${RESET} setup..."
  echo ""
  exec bunx oh-my-agent@latest
}

main "$@"
