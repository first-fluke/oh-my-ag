#!/bin/bash
# spawn-subagent.sh - Launch a Gemini CLI subagent in the background
#
# Usage: scripts/spawn-subagent.sh <agent-id> <prompt-file> <session-id> <workspace>
#
# Arguments:
#   agent-id    - Identifier for the agent (e.g., "backend", "frontend")
#   prompt-file - Path to file containing the full prompt
#   session-id  - Session identifier for log/pid file naming
#   workspace   - Working directory for the subagent
#
# Outputs:
#   - Log file: /tmp/subagent-{session-id}-{agent-id}.log
#   - PID file: /tmp/subagent-{session-id}-{agent-id}.pid
#   - Prints the PID to stdout

set -euo pipefail

AGENT_ID="$1"
PROMPT_FILE="$2"
SESSION_ID="$3"
WORKSPACE="$4"

LOG_FILE="/tmp/subagent-${SESSION_ID}-${AGENT_ID}.log"
PID_FILE="/tmp/subagent-${SESSION_ID}-${AGENT_ID}.pid"

# Validate inputs
if [ ! -f "$PROMPT_FILE" ]; then
  echo "ERROR: Prompt file not found: $PROMPT_FILE" >&2
  exit 1
fi

if [ ! -d "$WORKSPACE" ]; then
  echo "ERROR: Workspace directory not found: $WORKSPACE" >&2
  exit 1
fi

# Cleanup function: remove PID/LOG files after child exits
cleanup() {
  rm -f "$PID_FILE"
  rm -f "$LOG_FILE"
}

# Launch subagent in background
cd "$WORKSPACE" && \
  gemini -p "$(cat "$PROMPT_FILE")" --yolo \
  > "$LOG_FILE" 2>&1 &

PID=$!
echo "$PID" > "$PID_FILE"

# When this script's session ends, kill the child and clean up
trap 'kill "$PID" 2>/dev/null; wait "$PID" 2>/dev/null; cleanup' EXIT SIGINT SIGTERM

echo "$PID"

# Wait for child so trap can fire on its exit
wait "$PID" 2>/dev/null
cleanup
