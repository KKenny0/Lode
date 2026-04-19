#!/usr/bin/env bash
# Sync the canonical weekly-ppt-convention.md to all skill directories that need it.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CANONICAL="$REPO_ROOT/references/weekly-ppt-convention.md"

if [ ! -f "$CANONICAL" ]; then
  echo "Error: canonical file not found at $CANONICAL"
  exit 1
fi

TARGETS=(
  "$REPO_ROOT/skills/stage-doc-generator/references/"
  "$REPO_ROOT/skills/pipeline-doc-generator/references/"
  "$REPO_ROOT/skills/weekly-change-tracker/references/"
)

for target in "${TARGETS[@]}"; do
  cp "$CANONICAL" "$target"
  echo "Synced to $target"
done
