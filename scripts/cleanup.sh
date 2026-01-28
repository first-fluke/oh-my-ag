#!/bin/bash
# cleanup.sh - Clean up orphaned subagent processes and /tmp files
#
# Usage: scripts/cleanup.sh [--dry-run]
#
# Safely cleans:
#   1. Orphaned subagent processes (using PID files in /tmp)
#   2. Stale PID files in /tmp/subagent-*
#   3. Stale LOG files in /tmp/subagent-*
#   4. PID list files from parallel-run.sh (in .agent/results/)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/.agent/results"

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

cleaned=0
skipped=0

log_action() {
  if [[ "$DRY_RUN" == true ]]; then
    echo -e "${YELLOW}[DRY-RUN]${NC} $1"
  else
    echo -e "${GREEN}[CLEAN]${NC} $1"
  fi
}

log_skip() {
  echo -e "${CYAN}[SKIP]${NC} $1"
  ((skipped++))
}

echo -e "${CYAN}======================================${NC}"
echo -e "${CYAN}  SubAgent Cleanup${NC}"
if [[ "$DRY_RUN" == true ]]; then
  echo -e "  ${YELLOW}(Dry-run mode — no changes)${NC}"
fi
echo -e "${CYAN}======================================${NC}"
echo ""

# --- 1. Kill orphaned subagent processes via PID files ---
echo -e "${CYAN}[Step 1]${NC} Checking /tmp/subagent-*.pid files..."

for pid_file in /tmp/subagent-*.pid; do
  [[ -f "$pid_file" ]] || continue

  pid=$(cat "$pid_file" 2>/dev/null || echo "")
  if [[ -z "$pid" ]]; then
    log_action "Removing empty PID file: $pid_file"
    [[ "$DRY_RUN" == false ]] && rm -f "$pid_file"
    ((cleaned++))
    continue
  fi

  if kill -0 "$pid" 2>/dev/null; then
    # Process still running — kill it
    log_action "Killing orphaned process PID=$pid (from $pid_file)"
    if [[ "$DRY_RUN" == false ]]; then
      kill "$pid" 2>/dev/null || true
      # Wait briefly, then force-kill if still alive
      sleep 1
      if kill -0 "$pid" 2>/dev/null; then
        kill -9 "$pid" 2>/dev/null || true
      fi
      rm -f "$pid_file"
    fi
    ((cleaned++))
  else
    # Process already dead — just clean up the stale PID file
    log_action "Removing stale PID file (process gone): $pid_file"
    [[ "$DRY_RUN" == false ]] && rm -f "$pid_file"
    ((cleaned++))
  fi
done

# --- 2. Clean up stale /tmp/subagent-*.log files ---
echo ""
echo -e "${CYAN}[Step 2]${NC} Checking /tmp/subagent-*.log files..."

for log_file in /tmp/subagent-*.log; do
  [[ -f "$log_file" ]] || continue

  # Check if there's a matching PID file with a running process
  pid_file="${log_file%.log}.pid"
  if [[ -f "$pid_file" ]]; then
    pid=$(cat "$pid_file" 2>/dev/null || echo "")
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      log_skip "Log file has active process: $log_file"
      continue
    fi
  fi

  log_action "Removing stale log file: $log_file"
  [[ "$DRY_RUN" == false ]] && rm -f "$log_file"
  ((cleaned++))
done

# --- 3. Clean up parallel-run PID list files ---
echo ""
echo -e "${CYAN}[Step 3]${NC} Checking parallel-run PID list files..."

if [[ -d "$RESULTS_DIR" ]]; then
  for pid_list in "$RESULTS_DIR"/parallel-*/pids.txt; do
    [[ -f "$pid_list" ]] || continue

    has_running=false
    while IFS=: read -r pid agent; do
      [[ -z "$pid" ]] && continue
      if kill -0 "$pid" 2>/dev/null; then
        has_running=true
        log_action "Killing orphaned parallel agent PID=$pid ($agent)"
        if [[ "$DRY_RUN" == false ]]; then
          kill "$pid" 2>/dev/null || true
        fi
        ((cleaned++))
      fi
    done < "$pid_list"

    if [[ "$has_running" == false ]]; then
      log_action "Removing stale PID list: $pid_list"
      [[ "$DRY_RUN" == false ]] && rm -f "$pid_list"
      ((cleaned++))
    else
      # Give processes time to die, then clean up
      if [[ "$DRY_RUN" == false ]]; then
        sleep 1
        rm -f "$pid_list"
      fi
    fi
  done
else
  log_skip "No results directory found: $RESULTS_DIR"
fi

# --- Summary ---
echo ""
echo -e "${CYAN}======================================${NC}"
echo -e "${CYAN}  Cleanup Summary${NC}"
echo -e "${CYAN}======================================${NC}"
echo -e "  Cleaned: ${GREEN}${cleaned}${NC}"
echo -e "  Skipped: ${CYAN}${skipped}${NC}"
if [[ "$DRY_RUN" == true ]]; then
  echo -e "  ${YELLOW}Run without --dry-run to apply changes${NC}"
fi
echo -e "${CYAN}======================================${NC}"
