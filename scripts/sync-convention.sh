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
  "$REPO_ROOT/skills/lode-arch-doc/references/"
  "$REPO_ROOT/skills/lode-session-recap/references/"
)

for target in "${TARGETS[@]}"; do
  cp "$CANONICAL" "$target"
  echo "Synced to $target"
done
