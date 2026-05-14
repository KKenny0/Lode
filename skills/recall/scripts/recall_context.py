#!/usr/bin/env python3
"""Prepare bounded Lode recall context for the current project."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
from typing import Any

try:
    import yaml  # type: ignore
except Exception:  # pragma: no cover
    yaml = None


SKIP_DIRS = {".git", "node_modules", "dist", "__pycache__"}
INTENT_ARTIFACT_RE = re.compile(
    r"\b(DESIGN\.md|PLAN\.md|AGENTS\.md|README(?:\.cn)?\.md)\b|"
    r"(design|plan|architecture|prompt|schema|contract|migration|config)",
    re.IGNORECASE,
)


def load_yaml_config(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    raw = path.read_text(encoding="utf-8")
    if yaml is not None:
        data = yaml.safe_load(raw) or {}
        return data if isinstance(data, dict) else {}
    result: dict[str, Any] = {}
    for line in raw.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or line[:1].isspace() or ":" not in line:
            continue
        key, value = line.split(":", 1)
        result[key.strip()] = value.strip().strip("'\"")
    return result


def find_project_config(cwd: Path) -> Path | None:
    current = cwd.resolve()
    for directory in (current, *current.parents):
        candidate = directory / ".lode" / "config.yaml"
        if candidate.exists():
            return candidate
    return None


def resolve_config(cwd: Path) -> dict[str, Any]:
    global_cfg = load_yaml_config(Path.home() / ".lode" / "config.yaml")
    project_path = find_project_config(cwd)
    project_cfg = load_yaml_config(project_path) if project_path else {}
    cfg = dict(global_cfg)
    cfg.update(project_cfg)
    if "knowledge_vault" not in cfg:
        env_vault = os.environ.get("WEEKLY_PPT_PATH")
        if env_vault:
            cfg["knowledge_vault"] = env_vault
    return cfg


def slugify(name: str) -> str:
    slug = re.sub(r"[\s_]+", "-", name.strip().lower())
    slug = re.sub(r"[^a-z0-9-]+", "-", slug)
    return re.sub(r"-+", "-", slug).strip("-") or "project"


def same_path(left: str, right: Path) -> bool:
    try:
        return Path(left).expanduser().resolve() == right.expanduser().resolve()
    except OSError:
        return Path(left).expanduser().absolute() == right.expanduser().absolute()


def project_slug(cwd: Path, vault: Path | None, slug_override: str | None) -> str:
    if slug_override:
        return slug_override
    cfg = resolve_config(cwd)
    configured = cfg.get("project_slug")
    if isinstance(configured, str) and configured.strip():
        return configured.strip()
    if vault:
        projects_file = vault / "raw" / "projects.json"
        if projects_file.exists():
            try:
                projects = json.loads(projects_file.read_text(encoding="utf-8"))
                if isinstance(projects, list):
                    for project in projects:
                        if isinstance(project, dict) and isinstance(project.get("path"), str):
                            if same_path(project["path"], cwd) and isinstance(project.get("slug"), str):
                                return project["slug"]
            except json.JSONDecodeError:
                pass
    return slugify(cwd.name)


def resolve_vault(cwd: Path, vault_override: str | None) -> Path | None:
    if vault_override:
        return Path(vault_override).expanduser().resolve()
    cfg = resolve_config(cwd)
    value = cfg.get("knowledge_vault")
    if isinstance(value, str) and value.strip():
        return Path(value).expanduser().resolve()
    fallback = Path.home() / ".weekly-ppt"
    return fallback.resolve() if fallback.exists() else None


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


def parse_timestamp(entry: dict[str, Any]) -> str:
    value = entry.get("timestamp")
    return value if isinstance(value, str) else ""


def signal_score(entry: dict[str, Any]) -> int:
    score = 0
    if entry.get("type") == "decision":
        score += 5
    if entry.get("status") == "risk" or entry.get("type") == "risk":
        score += 5
    for field, weight in (
        ("open_questions", 4),
        ("abandoned_alternatives", 3),
        ("exploration_paths", 2),
        ("motivation", 1),
    ):
        value = entry.get(field)
        if isinstance(value, list) and value:
            score += weight
        elif isinstance(value, str) and value.strip():
            score += weight
    return score


def read_entries(vault: Path, slug: str) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    weeks_dir = vault / "raw" / "weeks"
    if not weeks_dir.exists():
        return entries
    for week_dir in sorted(weeks_dir.iterdir()):
        if not week_dir.is_dir():
            continue
        entries.extend(read_json_array(week_dir / f"{slug}.json"))
    return sorted(entries, key=parse_timestamp, reverse=True)


def extract_list(entries: list[dict[str, Any]], field: str) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    for entry in entries:
        timestamp = parse_timestamp(entry)
        value = entry.get(field)
        if isinstance(value, list):
            for item in value:
                if isinstance(item, str) and item.strip():
                    results.append({"timestamp": timestamp, "value": item.strip(), "summary": str(entry.get("summary", ""))})
    return results


def extract_decisions(entries: list[dict[str, Any]]) -> list[dict[str, str]]:
    decisions: list[dict[str, str]] = []
    for entry in entries:
        if entry.get("type") == "decision" or entry.get("status") == "decision":
            decisions.append({
                "timestamp": parse_timestamp(entry),
                "summary": str(entry.get("summary", "")),
                "context": str(entry.get("context", "")),
            })
    return decisions


def extract_risks(entries: list[dict[str, Any]]) -> list[dict[str, str]]:
    risks: list[dict[str, str]] = []
    for entry in entries:
        if entry.get("type") == "risk" or entry.get("status") == "risk":
            risks.append({
                "timestamp": parse_timestamp(entry),
                "summary": str(entry.get("summary", "")),
                "context": str(entry.get("context", "")),
            })
    return risks


def extract_intent_artifact_flags(entries: list[dict[str, Any]], limit: int) -> list[dict[str, str]]:
    flags: list[dict[str, str]] = []
    for entry in entries:
        explicit = entry.get("sync_suggestions")
        if isinstance(explicit, list):
            for item in explicit:
                if isinstance(item, str) and item.strip():
                    flags.append({
                        "timestamp": parse_timestamp(entry),
                        "summary": str(entry.get("summary", "")),
                        "reason": item.strip(),
                        "source": "sync_suggestions",
                    })
        searchable = " ".join(
            str(value)
            for key, value in entry.items()
            if key in {"summary", "context", "motivation", "impact"}
        )
        related_docs = entry.get("related_docs")
        if isinstance(related_docs, list):
            searchable = f"{searchable} {' '.join(str(item) for item in related_docs)}"
        if INTENT_ARTIFACT_RE.search(searchable):
            flags.append({
                "timestamp": parse_timestamp(entry),
                "summary": str(entry.get("summary", "")),
                "reason": "Recent raw entry mentions an intent artifact or contract-like change; review for possible staleness.",
                "source": "presence_match",
            })
    seen: set[tuple[str, str, str]] = set()
    unique: list[dict[str, str]] = []
    for flag in flags:
        key = (flag["timestamp"], flag["summary"], flag["reason"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(flag)
    return unique[:limit]


def read_artifacts(vault: Path, slug: str) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    artifacts = read_json_array(vault / "raw" / "artifacts" / f"{slug}.json")
    missing: list[dict[str, str]] = []
    for artifact in artifacts:
        path_value = artifact.get("path")
        if isinstance(path_value, str) and not Path(path_value).expanduser().exists():
            missing.append({
                "artifact_id": str(artifact.get("id", "")),
                "path": path_value,
            })
    return artifacts, missing


def build_context(cwd: Path, vault_override: str | None, slug_override: str | None, limit: int) -> dict[str, Any]:
    vault = resolve_vault(cwd, vault_override)
    slug = project_slug(cwd, vault, slug_override)
    if vault is None or not vault.exists():
        return {
            "project_slug": slug,
            "recent_entries": [],
            "open_questions": [],
            "risks": [],
            "abandoned_alternatives": [],
            "decisions": [],
            "artifacts": [],
            "intent_artifact_flags": [],
            "missing_sources": [{"type": "vault", "path": str(vault) if vault else ""}],
        }

    entries = read_entries(vault, slug)
    ranked = sorted(entries, key=lambda entry: (signal_score(entry), parse_timestamp(entry)), reverse=True)
    recent_entries = ranked[:limit]
    artifacts, missing_artifacts = read_artifacts(vault, slug)
    return {
        "project_slug": slug,
        "recent_entries": recent_entries,
        "open_questions": extract_list(entries, "open_questions")[:limit],
        "risks": extract_risks(entries)[:limit],
        "abandoned_alternatives": extract_list(entries, "abandoned_alternatives")[:limit],
        "decisions": extract_decisions(entries)[:limit],
        "artifacts": artifacts[:limit],
        "intent_artifact_flags": extract_intent_artifact_flags(entries, limit),
        "missing_sources": missing_artifacts,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare Lode session-start recall context")
    parser.add_argument("--cwd", default=os.getcwd(), help="Project working directory")
    parser.add_argument("--vault", help="Knowledge vault override")
    parser.add_argument("--slug", help="Project slug override")
    parser.add_argument("--limit", type=int, default=12, help="Maximum entries per section")
    args = parser.parse_args()

    context = build_context(
        cwd=Path(args.cwd).expanduser().resolve(),
        vault_override=args.vault,
        slug_override=args.slug,
        limit=max(args.limit, 1),
    )
    print(json.dumps(context, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
