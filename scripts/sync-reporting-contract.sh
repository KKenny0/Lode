#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CANONICAL="$REPO_ROOT/references/reporting-narrative-contract.md"

if [ ! -f "$CANONICAL" ]; then
  echo "Error: canonical file not found at $CANONICAL"
  exit 1
fi

TARGETS=(
  "$REPO_ROOT/skills/daily/references/reporting-narrative-contract.md"
  "$REPO_ROOT/skills/weekly/references/reporting-narrative-contract.md"
  "$REPO_ROOT/skills/monthly/references/reporting-narrative-contract.md"
)

for target in "${TARGETS[@]}"; do
  cp "$CANONICAL" "$target"
  echo "Synced to $target"
done
