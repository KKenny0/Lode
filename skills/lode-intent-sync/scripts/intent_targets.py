#!/usr/bin/env python3
"""Discover repo-local intent artifacts for Lode intent sync."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path


SKIP_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "__pycache__",
    "cli/skills",
}
SKIP_PARTS = {"evals"}
ROOT_TARGETS = {
    "DESIGN.md": "design",
    "PLAN.md": "plan",
    "AGENTS.md": "agent-rules",
    "README.md": "readme",
    "README.cn.md": "readme",
}
DOC_KEYWORDS = ("prompt", "schema", "contract", "architecture", "design")


def should_skip(path: Path, root: Path) -> bool:
    rel_parts = path.relative_to(root).parts
    if any(part in SKIP_PARTS for part in rel_parts):
        return True
    joined = "/".join(rel_parts)
    return any(joined == item or joined.startswith(f"{item}/") for item in SKIP_DIRS)


def add_target(targets: list[dict[str, str]], root: Path, path: Path, kind: str, reason: str) -> None:
    targets.append({
        "kind": kind,
        "path": str(path.resolve()),
        "repo_relative_path": str(path.relative_to(root)).replace("\\", "/"),
        "reason": reason,
    })


def discover(root: Path) -> list[dict[str, str]]:
    targets: list[dict[str, str]] = []
    for name, kind in ROOT_TARGETS.items():
        candidate = root / name
        if candidate.exists() and candidate.is_file():
            add_target(targets, root, candidate, kind, f"root {name} captures project intent")

    config = root / ".lode" / "config.yaml"
    if config.exists() and config.is_file():
        add_target(targets, root, config, "config", "project-level Lode configuration")

    for path in root.rglob("*.md"):
        if should_skip(path, root):
            continue
        rel = str(path.relative_to(root)).replace("\\", "/")
        if rel in ROOT_TARGETS:
            continue
        lower_name = path.name.lower()
        if any(keyword in lower_name for keyword in DOC_KEYWORDS):
            add_target(targets, root, path, "doc", "filename suggests prompt/schema/contract/architecture/design intent")

    return targets


def main() -> int:
    parser = argparse.ArgumentParser(description="Discover Lode intent sync targets")
    parser.add_argument("--cwd", default=os.getcwd(), help="Project root or working directory")
    args = parser.parse_args()
    root = Path(args.cwd).expanduser().resolve()
    print(json.dumps({"cwd": str(root), "targets": discover(root)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
