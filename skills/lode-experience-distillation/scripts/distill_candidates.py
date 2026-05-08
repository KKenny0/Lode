#!/usr/bin/env python3
"""Extract conservative reusable-rule candidates from Lode memory."""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


def read_json_array(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    if not isinstance(data, list):
        return []
    return [item for item in data if isinstance(item, dict)]


def read_entries(vault: Path, slug: str) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    weeks = vault / "raw" / "weeks"
    if not weeks.exists():
        return []
    for week_dir in sorted(weeks.iterdir()):
        if week_dir.is_dir():
            entries.extend(read_json_array(week_dir / f"{slug}.json"))
    return entries


def collect_terms(entries: list[dict[str, Any]]) -> dict[str, list[dict[str, str]]]:
    buckets: dict[str, list[dict[str, str]]] = defaultdict(list)
    keywords = {
        "artifact-index-staleness": ("artifact index", "stale", "re-index"),
        "repair-loop-ownership": ("repair", "ownership", "validation"),
        "retry-boundary": ("retry", "boundary", "orchestration"),
    }
    for entry in entries:
        text = " ".join(str(entry.get(field, "")) for field in ("summary", "context", "motivation")).lower()
        for key, needles in keywords.items():
            if any(needle in text for needle in needles):
                buckets[key].append({
                    "timestamp": str(entry.get("timestamp", "")),
                    "summary": str(entry.get("summary", "")),
                })
    return buckets


def build_candidates(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets = collect_terms(entries)
    candidates: list[dict[str, Any]] = []
    for pattern, evidence in buckets.items():
        count = len(evidence)
        if count >= 2:
            target = "AGENTS.md"
            artifact_type = "agents-rule"
            confidence = 0.78
            overfit = "medium"
        else:
            target = "docs/checklists.md"
            artifact_type = "checklist"
            confidence = 0.45
            overfit = "high"
        candidates.append({
            "pattern": pattern,
            "evidence": evidence,
            "suggested_artifact_type": artifact_type,
            "target_file": target,
            "risk_of_overfitting": overfit,
            "confidence": confidence,
        })
    return candidates


def main() -> int:
    parser = argparse.ArgumentParser(description="Distill reusable Lode candidates")
    parser.add_argument("--vault", required=True)
    parser.add_argument("--slug", required=True)
    args = parser.parse_args()
    entries = read_entries(Path(args.vault).expanduser().resolve(), args.slug)
    print(json.dumps({"project_slug": args.slug, "candidates": build_candidates(entries)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
