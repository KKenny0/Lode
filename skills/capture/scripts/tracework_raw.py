#!/usr/bin/env python3
"""Shared Tracework raw storage helper.

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
VALID_STATUSES = {"done", "ongoing", "risk", "decision"}
REQUIRED_FIELDS = ("timestamp", "type", "summary", "context", "source")
VALID_ARCHETYPES = {"decision", "build", "investigation", "repair", "maintenance"}
ARCHETYPE_REQUIRED_FIELDS = {
    "decision": ("motivation", "exploration_paths"),
    "build": ("motivation", "impact"),
    "investigation": ("exploration_paths", "open_questions"),
    "repair": ("motivation", "root_cause"),
    "maintenance": (),
}
VALID_ARTIFACT_TYPES = {
    "arch-doc",
    "design-doc",
    "plan-doc",
    "agents-rule",
    "prompt-contract",
    "schema-contract",
    "checklist",
    "roadmap",
    "review",
    "other",
}
VALID_ARTIFACT_STATUSES = {"active", "draft", "superseded", "obsolete", "missing"}
REQUIRED_ARTIFACT_FIELDS = (
    "id",
    "project_slug",
    "artifact_type",
    "title",
    "path",
    "created_at",
    "updated_at",
    "source",
    "status",
)
ARTIFACT_LIST_FIELDS = (
    "topics",
    "decision_threads",
    "open_questions",
    "risk_refs",
    "evidence_refs",
    "supersedes",
)


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
    """Parse the simple top-level config shape used by Tracework.

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
        candidate = directory / ".tracework" / "config.yaml"
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
    global_path = Path.home() / ".tracework" / "config.yaml"
    project_path = find_project_config(cwd)

    global_cfg = load_yaml_config(global_path)
    if global_cfg:
        sources.append(str(global_path))

    project_cfg: dict[str, Any] = {}
    if project_path is not None:
        project_cfg = load_yaml_config(project_path)
        sources.append(str(project_path))

    cfg = merge_configs(global_cfg, project_cfg)

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


def warn(message: str) -> None:
    print(f"warning: {message}", file=sys.stderr)


def has_value(entry: dict[str, Any], field: str) -> bool:
    value = entry.get(field)
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, list):
        return len(value) > 0
    return value is not None


def validate_string_list(entry: dict[str, Any], field: str) -> None:
    if field in entry:
        if not isinstance(entry[field], list) or not all(
            isinstance(item, str) for item in entry[field]
        ):
            raise ValueError(f"entry {field} must be a list of strings when present")


def validate_artifact_context(entry: dict[str, Any]) -> None:
    if "artifact_context" not in entry:
        return
    contexts = entry["artifact_context"]
    if not isinstance(contexts, list):
        raise ValueError("entry artifact_context must be a list when present")
    required = ("artifact_path", "scope", "delta", "source_of_truth")
    for index, context in enumerate(contexts):
        if not isinstance(context, dict):
            raise ValueError(f"entry artifact_context[{index}] must be an object")
        missing = [field for field in required if field not in context]
        if missing:
            raise ValueError(
                f"entry artifact_context[{index}] missing required fields: "
                + ", ".join(missing)
            )
        for field in ("artifact_path", "scope", "delta"):
            if not isinstance(context[field], str) or not context[field].strip():
                raise ValueError(
                    f"entry artifact_context[{index}].{field} must be a non-empty string"
                )
        if not Path(context["artifact_path"]).expanduser().is_absolute():
            raise ValueError(
                f"entry artifact_context[{index}].artifact_path must be absolute: "
                + context["artifact_path"]
            )
        for field in ("open_questions", "source_of_truth"):
            if field in context:
                if not isinstance(context[field], list) or not all(
                    isinstance(item, str) for item in context[field]
                ):
                    raise ValueError(
                        f"entry artifact_context[{index}].{field} must be a list of strings"
                    )


def validate_source_refs(entry: dict[str, Any]) -> None:
    if "source_refs" not in entry:
        return
    refs = entry["source_refs"]
    if not isinstance(refs, list):
        raise ValueError("entry source_refs must be a list when present")
    for index, ref in enumerate(refs):
        if not isinstance(ref, dict):
            raise ValueError(f"entry source_refs[{index}] must be an object")
        for field in ("type", "ref"):
            if not isinstance(ref.get(field), str) or not ref[field].strip():
                raise ValueError(f"entry source_refs[{index}].{field} must be a non-empty string")
        for field in ("path", "url", "note", "timestamp"):
            if field in ref and (not isinstance(ref[field], str) or not ref[field].strip()):
                raise ValueError(f"entry source_refs[{index}].{field} must be a non-empty string when present")


def validate_lifecycle_transition(entry: dict[str, Any]) -> None:
    if "lifecycle_transition" not in entry:
        return
    transition = entry["lifecycle_transition"]
    if not isinstance(transition, dict):
        raise ValueError("entry lifecycle_transition must be an object when present")
    for field in ("subject", "from", "to", "reason"):
        if field in transition and (
            not isinstance(transition[field], str) or not transition[field].strip()
        ):
            raise ValueError(f"entry lifecycle_transition.{field} must be a non-empty string when present")


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
    for field in (
        "related_docs",
        "evidence_refs",
        "decision_threads",
        "exploration_paths",
        "abandoned_alternatives",
        "open_questions",
        "sync_suggestions",
    ):
        validate_string_list(entry, field)
    if "related_docs" in entry:
        relative_docs = [
            item for item in entry["related_docs"] if not Path(item).expanduser().is_absolute()
        ]
        if relative_docs:
            raise ValueError(
                "entry related_docs must contain absolute paths: "
                + ", ".join(relative_docs)
            )
    for field in ("project_area", "work_stream", "impact", "motivation", "root_cause"):
        if field in entry and (
            not isinstance(entry[field], str) or not entry[field].strip()
        ):
            raise ValueError(f"entry {field} must be a non-empty string when present")
    validate_source_refs(entry)
    validate_lifecycle_transition(entry)
    if "status" in entry and entry["status"] not in VALID_STATUSES:
        raise ValueError(f"entry status must be one of: {', '.join(sorted(VALID_STATUSES))}")
    if "archetype" in entry and entry["archetype"] not in VALID_ARCHETYPES:
        raise ValueError(
            f"entry archetype must be one of: {', '.join(sorted(VALID_ARCHETYPES))}"
        )
    validate_artifact_context(entry)
    if entry["source"] == "arch-doc":
        warn("entry source 'arch-doc' is legacy-only; new producers should use 'session-recap'")
    if entry["source"] == "session-recap" and "archetype" not in entry:
        warn("session-recap entry missing archetype; adaptive-depth consumers may treat it as legacy")
    archetype = entry.get("archetype")
    if isinstance(archetype, str) and archetype in ARCHETYPE_REQUIRED_FIELDS:
        for field in ARCHETYPE_REQUIRED_FIELDS[archetype]:
            if not has_value(entry, field):
                warn(f"{archetype} entry missing recommended field: {field}")
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

    # Overwrite LLM-provided timestamps with the authoritative server clock.
    # LLMs do not have access to a real-time clock and can hallucinate
    # timestamps that are minutes (or more) off from the actual time.
    now_iso = dt.datetime.now().astimezone().isoformat()
    for entry in entries:
        entry["timestamp"] = now_iso

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


def validate_artifact(artifact: Any) -> dict[str, Any]:
    if not isinstance(artifact, dict):
        raise ValueError("artifact must be a JSON object")
    missing = [field for field in REQUIRED_ARTIFACT_FIELDS if field not in artifact]
    if missing:
        raise ValueError(f"artifact missing required fields: {', '.join(missing)}")
    for field in REQUIRED_ARTIFACT_FIELDS:
        if field == "status":
            continue
        if not isinstance(artifact[field], str) or not artifact[field].strip():
            raise ValueError(f"artifact field must be a non-empty string: {field}")
    if artifact["artifact_type"] not in VALID_ARTIFACT_TYPES:
        raise ValueError(
            "artifact artifact_type must be one of: "
            + ", ".join(sorted(VALID_ARTIFACT_TYPES))
        )
    if artifact["status"] not in VALID_ARTIFACT_STATUSES:
        raise ValueError(
            "artifact status must be one of: "
            + ", ".join(sorted(VALID_ARTIFACT_STATUSES))
        )
    if not Path(artifact["path"]).expanduser().is_absolute():
        raise ValueError(f"artifact path must be absolute: {artifact['path']}")
    for field in ARTIFACT_LIST_FIELDS:
        if field in artifact:
            if not isinstance(artifact[field], list) or not all(
                isinstance(item, str) for item in artifact[field]
            ):
                raise ValueError(f"artifact {field} must be a list of strings when present")
    if "repo_relative_path" in artifact and (
        not isinstance(artifact["repo_relative_path"], str)
        or not artifact["repo_relative_path"].strip()
    ):
        raise ValueError("artifact repo_relative_path must be a non-empty string when present")
    if "superseded_by" in artifact and artifact["superseded_by"] is not None:
        if not isinstance(artifact["superseded_by"], str) or not artifact["superseded_by"].strip():
            raise ValueError("artifact superseded_by must be a non-empty string or null")
    return artifact


def load_artifact(path: Path) -> dict[str, Any]:
    return validate_artifact(json.loads(path.read_text(encoding="utf-8")))


def upsert_artifact(
    artifact_path: Path,
    cwd: Path,
    vault_override: Path | None,
    slug_override: str | None,
) -> dict[str, Any]:
    cfg, _ = resolve_config(cwd)
    vault = vault_override or Path(str(cfg["knowledge_vault"]))
    artifact = load_artifact(artifact_path)
    slug = slug_override or project_slug(cwd, vault)
    target_dir = vault / "raw" / "artifacts"
    target_dir.mkdir(parents=True, exist_ok=True)
    target_file = target_dir / f"{slug}.json"

    existing: list[Any] = []
    if target_file.exists():
        existing_data = json.loads(target_file.read_text(encoding="utf-8"))
        if not isinstance(existing_data, list):
            raise ValueError(f"target file is not a JSON array: {target_file}")
        existing = existing_data

    action = "created"
    for index, item in enumerate(existing):
        if isinstance(item, dict) and item.get("id") == artifact["id"]:
            existing[index] = artifact
            action = "updated"
            break
    else:
        existing.append(artifact)

    target_file.write_text(
        json.dumps(existing, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return {
        "slug": slug,
        "path": str(target_file),
        "artifact_id": artifact["id"],
        "action": action,
        "total_artifacts": len(existing),
    }


def register_project(
    cwd: Path,
    vault_override: Path | None,
    name: str | None,
    slug_override: str | None,
    priority: str | None,
) -> dict[str, Any]:
    cfg, _ = resolve_config(cwd)
    vault = vault_override or Path(str(cfg["knowledge_vault"]))
    slug = slug_override or project_slug(cwd, vault)
    project_name = name or slug.replace("-", " ").title()
    project_path = str(cwd.resolve())

    target_dir = vault / "raw"
    target_dir.mkdir(parents=True, exist_ok=True)
    target_file = target_dir / "projects.json"

    existing: list[dict[str, Any]] = []
    if target_file.exists():
        try:
            data = json.loads(target_file.read_text(encoding="utf-8"))
            if isinstance(data, list):
                existing = data
        except json.JSONDecodeError:
            existing = []

    updated = False
    for index, item in enumerate(existing):
        if isinstance(item, dict) and same_path(str(item.get("path", "")), cwd):
            existing[index]["name"] = project_name
            existing[index]["slug"] = slug
            existing[index]["path"] = project_path
            if priority:
                existing[index]["priority"] = priority
            updated = True
            break

    if not updated:
        entry: dict[str, Any] = {
            "name": project_name,
            "slug": slug,
            "path": project_path,
        }
        if priority:
            entry["priority"] = priority
        existing.append(entry)

    target_file.write_text(
        json.dumps(existing, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return {
        "action": "updated" if updated else "registered",
        "name": project_name,
        "slug": slug,
        "path": project_path,
        "total_projects": len(existing),
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


def command_upsert_artifact(args: argparse.Namespace) -> int:
    vault = Path(args.vault).expanduser().resolve() if args.vault else None
    result = upsert_artifact(
        artifact_path=Path(args.artifact).expanduser().resolve(),
        cwd=Path(args.cwd).expanduser().resolve(),
        vault_override=vault,
        slug_override=args.slug,
    )
    print_json(result)
    return 0


def command_register_project(args: argparse.Namespace) -> int:
    vault = Path(args.vault).expanduser().resolve() if args.vault else None
    result = register_project(
        cwd=Path(args.cwd).expanduser().resolve(),
        vault_override=vault,
        name=args.name,
        slug_override=args.slug,
        priority=args.priority,
    )
    print_json(result)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Tracework raw storage helper")
    subparsers = parser.add_subparsers(dest="command", required=True)

    week_parser = subparsers.add_parser("week", help="Print ISO week string")
    week_parser.add_argument("--date", help="Date in YYYY-MM-DD format")
    week_parser.set_defaults(func=command_week)

    config_parser = subparsers.add_parser("resolve-config", help="Resolve Tracework config")
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

    artifact_parser = subparsers.add_parser("upsert-artifact", help="Upsert artifact index JSON")
    artifact_parser.add_argument("--artifact", required=True, help="Path to artifact JSON object")
    artifact_parser.add_argument("--cwd", default=os.getcwd(), help="Project working directory")
    artifact_parser.add_argument("--vault", help="Knowledge vault override")
    artifact_parser.add_argument("--slug", help="Project slug override")
    artifact_parser.set_defaults(func=command_upsert_artifact)

    register_parser = subparsers.add_parser("register-project", help="Register project in projects.json")
    register_parser.add_argument("--cwd", default=os.getcwd(), help="Project working directory")
    register_parser.add_argument("--vault", help="Knowledge vault override")
    register_parser.add_argument("--name", help="Human-readable project name")
    register_parser.add_argument("--slug", help="Project slug override")
    register_parser.add_argument("--priority", choices=["core", "supporting", "exploratory"])
    register_parser.set_defaults(func=command_register_project)

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
