#!/usr/bin/env bash
# Sync the canonical Tracework storage convention to all skill directories that need it.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CANONICAL="$REPO_ROOT/references/tracework-storage-convention.md"

if [ ! -f "$CANONICAL" ]; then
  echo "Error: canonical file not found at $CANONICAL"
  exit 1
fi

TARGETS=(
  "$REPO_ROOT/skills/capture/references/"
  "$REPO_ROOT/skills/recall/references/"
  "$REPO_ROOT/skills/roadmap/references/"
  "$REPO_ROOT/skills/monthly/references/"
)

for target in "${TARGETS[@]}"; do
  cp "$CANONICAL" "$target"
  echo "Synced to $target"
done
