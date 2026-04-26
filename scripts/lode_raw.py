#!/usr/bin/env python3
"""Shared Lode raw storage helper.

This script keeps path resolution and raw-entry appends deterministic so skills
can focus on writing high-quality change signals.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import sys
from typing import Any

try:
    import yaml  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    yaml = None


VALID_TYPES = {"feature", "fix", "refactor", "decision", "risk"}
VALID_SOURCES = {"session-recap", "arch-doc"}
REQUIRED_FIELDS = ("timestamp", "type", "summary", "context", "source")


def load_yaml_config(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    raw = path.read_text(encoding="utf-8")
    if yaml is not None:
        data = yaml.safe_load(raw) or {}
        if not isinstance(data, dict):
            raise ValueError(f"config is not a mapping: {path}")
        return data
    return parse_simple_yaml(raw)


def parse_simple_yaml(raw: str) -> dict[str, Any]:
    """Parse the simple top-level config shape used by Lode.

    This fallback intentionally handles only scalar top-level keys and ignores
    nested sections such as daily_note.
    """
    result: dict[str, Any] = {}
    for line in raw.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if line[:1].isspace() or ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if not value or value in {"|", ">"}:
            continue
        if " #" in value:
            value = value.split(" #", 1)[0].rstrip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        result[key] = value
    return result


def find_project_config(cwd: Path) -> Path | None:
    current = cwd.resolve()
    for directory in (current, *current.parents):
        candidate = directory / ".lode" / "config.yaml"
        if candidate.exists():
            return candidate
    return None


def merge_configs(global_cfg: dict[str, Any], project_cfg: dict[str, Any]) -> dict[str, Any]:
    merged = dict(global_cfg)
    for key, value in project_cfg.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            nested = dict(merged[key])
            nested.update(value)
            merged[key] = nested
        else:
            merged[key] = value
    return merged


def resolve_config(cwd: Path) -> tuple[dict[str, Any], list[str]]:
    sources: list[str] = []
    global_path = Path.home() / ".lode" / "config.yaml"
    project_path = find_project_config(cwd)

    global_cfg = load_yaml_config(global_path)
    if global_cfg:
        sources.append(str(global_path))

    project_cfg: dict[str, Any] = {}
    if project_path is not None:
        project_cfg = load_yaml_config(project_path)
        sources.append(str(project_path))

    cfg = merge_configs(global_cfg, project_cfg)

    if not cfg.get("knowledge_vault"):
        env_vault = os.environ.get("WEEKLY_PPT_PATH")
        if env_vault:
            cfg["knowledge_vault"] = env_vault
            sources.append("$WEEKLY_PPT_PATH")
        else:
            cfg["knowledge_vault"] = str(Path.home() / ".weekly-ppt")
            sources.append("~/.weekly-ppt")

    if cfg.get("knowledge_vault"):
        cfg["knowledge_vault"] = str(Path(cfg["knowledge_vault"]).expanduser().resolve())
    return cfg, sources


def iso_week(value: str | None = None) -> str:
    if value:
        date_value = dt.date.fromisoformat(value)
    else:
        date_value = dt.date.today()
    year, week, _ = date_value.isocalendar()
    return f"{year}-W{week:02d}"


def slugify(name: str) -> str:
    slug = re.sub(r"[\s_]+", "-", name.strip().lower())
    slug = re.sub(r"[^a-z0-9-]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug or "project"


def same_path(left: str, right: Path) -> bool:
    left_path = Path(left).expanduser()
    right_path = right.expanduser()
    try:
        return left_path.resolve() == right_path.resolve()
    except OSError:
        return left_path.absolute() == right_path.absolute()


def project_slug(cwd: Path, vault: Path | None = None) -> str:
    cfg, _ = resolve_config(cwd)
    configured = cfg.get("project_slug")
    if isinstance(configured, str) and configured.strip():
        return configured.strip()

    resolved_vault = vault or Path(str(cfg["knowledge_vault"]))
    projects_file = resolved_vault / "raw" / "projects.json"
    if projects_file.exists():
        try:
            projects = json.loads(projects_file.read_text(encoding="utf-8"))
            if isinstance(projects, list):
                for project in projects:
                    if not isinstance(project, dict):
                        continue
                    path_value = project.get("path")
                    slug_value = project.get("slug")
                    if isinstance(path_value, str) and isinstance(slug_value, str):
                        if same_path(path_value, cwd):
                            return slug_value
        except json.JSONDecodeError:
            pass

    return slugify(cwd.resolve().name)


def validate_entry(entry: Any) -> dict[str, Any]:
    if not isinstance(entry, dict):
        raise ValueError("entry must be a JSON object")
    missing = [field for field in REQUIRED_FIELDS if field not in entry]
    if missing:
        raise ValueError(f"entry missing required fields: {', '.join(missing)}")
    if entry["type"] not in VALID_TYPES:
        raise ValueError(f"entry type must be one of: {', '.join(sorted(VALID_TYPES))}")
    if entry["source"] not in VALID_SOURCES:
        raise ValueError(f"entry source must be one of: {', '.join(sorted(VALID_SOURCES))}")
    for field in ("timestamp", "summary", "context", "source", "type"):
        if not isinstance(entry[field], str) or not entry[field].strip():
            raise ValueError(f"entry field must be a non-empty string: {field}")
    if "related_docs" in entry and not isinstance(entry["related_docs"], list):
        raise ValueError("entry related_docs must be a list when present")
    return entry


def load_entries(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    raw_entries = data if isinstance(data, list) else [data]
    return [validate_entry(entry) for entry in raw_entries]


def append_entries(
    entry_path: Path,
    cwd: Path,
    date_value: str | None,
    vault_override: Path | None,
    slug_override: str | None,
) -> dict[str, Any]:
    cfg, _ = resolve_config(cwd)
    vault = vault_override or Path(str(cfg["knowledge_vault"]))
    slug = slug_override or project_slug(cwd, vault)
    week = iso_week(date_value)
    entries = load_entries(entry_path)

    target_dir = vault / "raw" / "weeks" / week
    target_dir.mkdir(parents=True, exist_ok=True)
    target_file = target_dir / f"{slug}.json"

    existing: list[Any] = []
    if target_file.exists():
        existing_data = json.loads(target_file.read_text(encoding="utf-8"))
        if not isinstance(existing_data, list):
            raise ValueError(f"target file is not a JSON array: {target_file}")
        existing = existing_data

    existing.extend(entries)
    target_file.write_text(
        json.dumps(existing, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return {
        "week": week,
        "slug": slug,
        "vault": str(vault),
        "path": str(target_file),
        "entries_appended": len(entries),
        "total_entries": len(existing),
    }


def print_json(data: Any) -> None:
    print(json.dumps(data, ensure_ascii=False, indent=2))


def command_week(args: argparse.Namespace) -> int:
    print(iso_week(args.date))
    return 0


def command_resolve_config(args: argparse.Namespace) -> int:
    cfg, sources = resolve_config(Path(args.cwd))
    print_json({"config": cfg, "sources": sources})
    return 0


def command_project_slug(args: argparse.Namespace) -> int:
    vault = Path(args.vault).expanduser().resolve() if args.vault else None
    print(project_slug(Path(args.cwd), vault))
    return 0


def command_append_entry(args: argparse.Namespace) -> int:
    vault = Path(args.vault).expanduser().resolve() if args.vault else None
    result = append_entries(
        entry_path=Path(args.entry).expanduser().resolve(),
        cwd=Path(args.cwd).expanduser().resolve(),
        date_value=args.date,
        vault_override=vault,
        slug_override=args.slug,
    )
    print_json(result)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Lode raw storage helper")
    subparsers = parser.add_subparsers(dest="command", required=True)

    week_parser = subparsers.add_parser("week", help="Print ISO week string")
    week_parser.add_argument("--date", help="Date in YYYY-MM-DD format")
    week_parser.set_defaults(func=command_week)

    config_parser = subparsers.add_parser("resolve-config", help="Resolve Lode config")
    config_parser.add_argument("--cwd", default=os.getcwd(), help="Project working directory")
    config_parser.set_defaults(func=command_resolve_config)

    slug_parser = subparsers.add_parser("project-slug", help="Resolve project slug")
    slug_parser.add_argument("--cwd", default=os.getcwd(), help="Project working directory")
    slug_parser.add_argument("--vault", help="Knowledge vault override")
    slug_parser.set_defaults(func=command_project_slug)

    append_parser = subparsers.add_parser("append-entry", help="Append raw entry JSON")
    append_parser.add_argument("--entry", required=True, help="Path to entry JSON object or array")
    append_parser.add_argument("--cwd", default=os.getcwd(), help="Project working directory")
    append_parser.add_argument("--date", help="Date in YYYY-MM-DD format for target ISO week")
    append_parser.add_argument("--vault", help="Knowledge vault override")
    append_parser.add_argument("--slug", help="Project slug override")
    append_parser.set_defaults(func=command_append_entry)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
