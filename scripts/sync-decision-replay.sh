#!/usr/bin/env bash
# Sync the canonical decision replay helper to every skill-local copy.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CANONICAL="$REPO_ROOT/references/decision_replay.py"

if [ ! -f "$CANONICAL" ]; then
  echo "Error: canonical file not found at $CANONICAL"
  exit 1
fi

TARGETS=(
  "$REPO_ROOT/skills/query/scripts/decision_replay.py"
  "$REPO_ROOT/skills/roadmap/scripts/decision_replay.py"
  "$REPO_ROOT/skills/recall/scripts/decision_replay.py"
)

for target in "${TARGETS[@]}"; do
  cp "$CANONICAL" "$target"
  echo "Synced to $target"
done
