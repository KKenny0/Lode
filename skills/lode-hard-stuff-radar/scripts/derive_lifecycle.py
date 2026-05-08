#!/usr/bin/env python3
"""Derive lifecycle-like state from Lode raw entries without mutating them."""

from __future__ import annotations

import argparse
import datetime as dt
import json
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
    return sorted(entries, key=lambda entry: str(entry.get("timestamp", "")))


def parse_time(value: Any) -> dt.datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        return dt.datetime.fromisoformat(value)
    except ValueError:
        return None


def entry_ref(entry: dict[str, Any]) -> dict[str, str]:
    return {
        "timestamp": str(entry.get("timestamp", "")),
        "summary": str(entry.get("summary", "")),
    }


def list_field(entry: dict[str, Any], field: str) -> list[str]:
    value = entry.get(field)
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, str) and item.strip()]


def derive(entries: list[dict[str, Any]], stale_days: int) -> dict[str, list[dict[str, Any]]]:
    now = dt.datetime.now().astimezone()
    open_questions: list[dict[str, Any]] = []
    answered_questions: list[dict[str, Any]] = []
    active_risks: list[dict[str, Any]] = []
    mitigated_risks: list[dict[str, Any]] = []
    active_decisions: list[dict[str, Any]] = []
    superseded_decisions: list[dict[str, Any]] = []
    stale_threads: list[dict[str, Any]] = []

    for entry in entries:
        summary = str(entry.get("summary", ""))
        context = str(entry.get("context", ""))
        combined = f"{summary} {context}".lower()
        timestamp = parse_time(entry.get("timestamp"))
        questions = list_field(entry, "open_questions")

        for question in questions:
            item = {"question": question, **entry_ref(entry)}
            if "answered" in combined or "resolved" in combined:
                answered_questions.append(item)
            else:
                open_questions.append(item)

        if entry.get("type") == "risk" or entry.get("status") == "risk":
            item = entry_ref(entry)
            if "mitigated" in combined or "resolved" in combined:
                mitigated_risks.append(item)
            else:
                active_risks.append(item)

        if entry.get("type") == "decision" or entry.get("status") == "decision":
            item = entry_ref(entry)
            if "superseded" in combined or "revised" in combined:
                superseded_decisions.append(item)
            else:
                active_decisions.append(item)

        if timestamp and questions:
            age_days = (now - timestamp.astimezone()).days if timestamp.tzinfo else (now.replace(tzinfo=None) - timestamp).days
            if age_days >= stale_days:
                stale_threads.append({
                    "age_days": age_days,
                    "open_questions": questions,
                    **entry_ref(entry),
                })

    return {
        "open_questions": open_questions,
        "answered_questions": answered_questions,
        "active_risks": active_risks,
        "mitigated_risks": mitigated_risks,
        "active_decisions": active_decisions,
        "superseded_decisions": superseded_decisions,
        "stale_threads": stale_threads,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Derive Lode lifecycle state")
    parser.add_argument("--vault", required=True, help="Knowledge vault path")
    parser.add_argument("--slug", required=True, help="Project slug")
    parser.add_argument("--stale-days", type=int, default=21)
    args = parser.parse_args()
    entries = read_entries(Path(args.vault).expanduser().resolve(), args.slug)
    print(json.dumps(derive(entries, max(args.stale_days, 1)), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
