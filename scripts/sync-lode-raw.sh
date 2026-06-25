#!/usr/bin/env bash
# Sync the canonical lode_raw.py to all skill directories that bundle it.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CANONICAL="$REPO_ROOT/scripts/lode_raw.py"

if [ ! -f "$CANONICAL" ]; then
  echo "Error: canonical file not found at $CANONICAL"
  exit 1
fi

TARGETS=(
  "$REPO_ROOT/skills/capture/scripts/"
  "$REPO_ROOT/skills/cold-start-interview/scripts/"
  "$REPO_ROOT/skills/recall/scripts/"
  "$REPO_ROOT/cli/skills/capture/scripts/"
)

for target in "${TARGETS[@]}"; do
  mkdir -p "$target"
  cp "$CANONICAL" "$target"
  echo "Synced to ${target}lode_raw.py"
done
