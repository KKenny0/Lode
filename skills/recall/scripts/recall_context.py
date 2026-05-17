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
STOPWORDS = {
    "about",
    "after",
    "and",
    "are",
    "because",
    "before",
    "build",
    "changed",
    "changes",
    "context",
    "decision",
    "did",
    "for",
    "from",
    "have",
    "into",
    "project",
    "session",
    "should",
    "source",
    "that",
    "the",
    "this",
    "using",
    "was",
    "were",
    "what",
    "when",
    "where",
    "which",
    "while",
    "why",
    "with",
    "without",
}
EXPLICIT_DECISION_FIELDS = (
    "motivation",
    "exploration_paths",
    "abandoned_alternatives",
    "open_questions",
)
SAFE_SLUG_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")


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
    for key, value in project_cfg.items():
        if isinstance(value, dict) and isinstance(cfg.get(key), dict):
            nested = dict(cfg[key])
            nested.update(value)
            cfg[key] = nested
        else:
            cfg[key] = value
    if "knowledge_vault" not in cfg:
        env_vault = os.environ.get("WEEKLY_PPT_PATH")
        if env_vault:
            cfg["knowledge_vault"] = env_vault
    return cfg


def slugify(name: str) -> str:
    slug = re.sub(r"[\s_]+", "-", name.strip().lower())
    slug = re.sub(r"[^a-z0-9-]+", "-", slug)
    return re.sub(r"-+", "-", slug).strip("-") or "project"


def validate_project_slug(slug: str) -> str:
    if not SAFE_SLUG_RE.fullmatch(slug):
        raise ValueError(
            "project slug must be a filename-safe value using letters, numbers, dots, underscores, or hyphens"
        )
    return slug


def same_path(left: str, right: Path) -> bool:
    try:
        return Path(left).expanduser().resolve() == right.expanduser().resolve()
    except OSError:
        return Path(left).expanduser().absolute() == right.expanduser().absolute()


def project_slug(cwd: Path, vault: Path | None, slug_override: str | None) -> str:
    if slug_override:
        return validate_project_slug(slug_override)
    cfg = resolve_config(cwd)
    configured = cfg.get("project_slug")
    if isinstance(configured, str) and configured.strip():
        return validate_project_slug(configured.strip())
    if vault:
        projects_file = vault / "raw" / "projects.json"
        if projects_file.exists():
            try:
                projects = json.loads(projects_file.read_text(encoding="utf-8"))
                if isinstance(projects, list):
                    for project in projects:
                        if isinstance(project, dict) and isinstance(project.get("path"), str):
                            if same_path(project["path"], cwd) and isinstance(project.get("slug"), str):
                                return validate_project_slug(project["slug"])
            except (json.JSONDecodeError, ValueError):
                pass
    return validate_project_slug(slugify(cwd.name))


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


def parse_datetime(value: Any) -> dt.datetime | None:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed


def max_entry_datetime(entries: list[dict[str, Any]]) -> dt.datetime | None:
    parsed = [item for item in (parse_datetime(entry.get("timestamp")) for entry in entries) if item is not None]
    return max(parsed) if parsed else None


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
        path = week_dir / f"{slug}.json"
        for index, entry in enumerate(read_json_array(path)):
            item = dict(entry)
            item["_source_path"] = str(path)
            item["_source_week"] = week_dir.name
            item["_source_index"] = index
            entries.append(item)
    return sorted(entries, key=parse_timestamp, reverse=True)


def public_entry(entry: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in entry.items() if not key.startswith("_")}


def as_string_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [item.strip() for item in value if isinstance(item, str) and item.strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def text_value(entry: dict[str, Any], field: str) -> str | None:
    value = entry.get(field)
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def dedupe(values: list[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        normalized = value.strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        result.append(normalized)
    return result


def keyword_tokens(text: str) -> list[str]:
    tokens = [
        token
        for token in re.findall(r"[a-zA-Z][a-zA-Z0-9-]{2,}", text.lower())
        if token not in STOPWORDS and not token.isdigit()
    ]
    return dedupe(tokens)


def has_explicit_decision_signal(entry: dict[str, Any]) -> bool:
    if entry.get("type") == "decision" or entry.get("archetype") == "decision":
        return True
    return any(as_string_list(entry.get(field)) or text_value(entry, field) for field in EXPLICIT_DECISION_FIELDS)


def chosen_path(entry: dict[str, Any]) -> str | None:
    paths = as_string_list(entry.get("exploration_paths"))
    chosen_markers = (
        "chosen",
        "selected",
        "adopted",
        "kept",
        "switched to",
        "replaced",
        "use ",
        "using ",
    )
    chosen = [path for path in paths if any(marker in path.lower() for marker in chosen_markers)]
    if chosen:
        return chosen[0]
    if has_explicit_decision_signal(entry):
        return text_value(entry, "summary")
    return None


def split_option_reason(value: str) -> dict[str, str]:
    for separator in (" -> ", ": ", " because ", " — ", " - "):
        if separator in value:
            option, reason = value.split(separator, 1)
            return {"option": option.strip(), "reason": reason.strip()}
    return {"option": value.strip(), "reason": ""}


def rejected_paths(entry: dict[str, Any]) -> list[dict[str, str]]:
    rejected = as_string_list(entry.get("abandoned_alternatives"))
    for path in as_string_list(entry.get("exploration_paths")):
        lowered = path.lower()
        if any(marker in lowered for marker in ("rejected", "abandoned", "did not", "deferred")):
            rejected.append(path)
    return [split_option_reason(item) for item in dedupe(rejected)]


def artifact_refs_from_entry(entry: dict[str, Any]) -> list[str]:
    refs: list[str] = []
    refs.extend(as_string_list(entry.get("related_docs")))
    for context in entry.get("artifact_context", []):
        if not isinstance(context, dict):
            continue
        artifact_path = context.get("artifact_path")
        if isinstance(artifact_path, str) and artifact_path.strip():
            refs.append(artifact_path.strip())
        refs.extend(as_string_list(context.get("source_of_truth")))
    return dedupe(refs)


def artifact_hints_for_entry(
    entry: dict[str, Any], artifacts: list[dict[str, Any]]
) -> tuple[list[str], list[str]]:
    entry_refs = set(artifact_refs_from_entry(entry))
    if not entry_refs:
        return [], []

    artifact_ids: list[str] = []
    thread_hints: list[str] = []
    for artifact in artifacts:
        artifact_path = artifact.get("path")
        repo_path = artifact.get("repo_relative_path")
        candidates = [item for item in (artifact_path, repo_path, artifact.get("id")) if isinstance(item, str)]
        if not entry_refs.intersection(candidates):
            continue
        artifact_id = artifact.get("id")
        if isinstance(artifact_id, str) and artifact_id.strip():
            artifact_ids.append(artifact_id.strip())
        thread_hints.extend(as_string_list(artifact.get("decision_threads")))
        thread_hints.extend(as_string_list(artifact.get("topics")))
    return dedupe(artifact_ids), dedupe(thread_hints)


def topic_keys(entry: dict[str, Any], artifact_thread_hints: list[str]) -> list[str]:
    keys: list[str] = []
    for field in ("project_area", "work_stream"):
        value = text_value(entry, field)
        if value:
            keys.append(slugify(value))
    keys.extend(slugify(item) for item in artifact_thread_hints)
    for context in entry.get("artifact_context", []):
        if not isinstance(context, dict):
            continue
        for field in ("scope", "delta"):
            value = text_value(context, field)
            if value:
                keys.extend(keyword_tokens(value)[:4])
    keys.extend(keyword_tokens(" ".join([str(entry.get("summary", "")), str(entry.get("context", ""))]))[:6])
    return dedupe([key for key in keys if key])


def thread_id_for(keys: list[str], entry: dict[str, Any]) -> str:
    for key in keys:
        if key:
            return f"thread:{slugify(key)}"
    summary = text_value(entry, "summary") or f"entry-{entry.get('_source_index', 0)}"
    words = keyword_tokens(summary)
    return f"thread:{'-'.join(words[:3]) or slugify(summary)[:48]}"


def entry_ref(entry: dict[str, Any]) -> dict[str, Any]:
    return {
        "week": entry.get("_source_week", ""),
        "path": entry.get("_source_path", ""),
        "timestamp": entry.get("timestamp"),
        "entry_index": entry.get("_source_index", 0),
    }


def decision_node_from_entry(
    entry: dict[str, Any], ordinal: int, slug: str, artifacts: list[dict[str, Any]]
) -> dict[str, Any]:
    artifact_ids, artifact_thread_hints = artifact_hints_for_entry(entry, artifacts)
    artifact_refs = dedupe([*artifact_refs_from_entry(entry), *artifact_ids])
    explicit = has_explicit_decision_signal(entry)
    keys = topic_keys(entry, artifact_thread_hints)
    inference_notes: list[str] = []
    if not explicit:
        inference_notes.append("Decision content inferred from summary/context because explicit decision fields were sparse.")
    return {
        "id": f"{slug}:{entry.get('_source_week', 'unknown-week')}:{ordinal:03d}",
        "timestamp": entry.get("timestamp"),
        "week": entry.get("_source_week", ""),
        "confidence": "explicit" if explicit else "inferred",
        "source_entry_refs": [entry_ref(entry)],
        "summary": text_value(entry, "summary") or "Untitled raw entry",
        "decision": text_value(entry, "summary") or "Untitled raw entry",
        "why": text_value(entry, "motivation") or text_value(entry, "context"),
        "chosen": chosen_path(entry),
        "rejected": rejected_paths(entry),
        "open_questions": as_string_list(entry.get("open_questions")),
        "impact": text_value(entry, "impact"),
        "topic_keys": keys,
        "artifact_refs": artifact_refs,
        "evidence_refs": as_string_list(entry.get("evidence_refs")),
        "thread_id": thread_id_for(keys, entry),
        "inference_notes": inference_notes,
    }


def build_decision_nodes_from_entries(
    entries: list[dict[str, Any]], slug: str, artifacts: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    chronological = sorted(entries, key=parse_timestamp)
    nodes: list[dict[str, Any]] = []
    for entry in chronological:
        if not isinstance(entry.get("summary"), str) or not isinstance(entry.get("context"), str):
            continue
        nodes.append(decision_node_from_entry(entry, len(nodes) + 1, slug, artifacts))
    return nodes


def shared_values(left: list[str], right: list[str]) -> list[str]:
    return sorted(set(left).intersection(right))


def build_edges(nodes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    edges: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()
    by_thread: dict[str, list[dict[str, Any]]] = {}
    for node in nodes:
        by_thread.setdefault(str(node.get("thread_id", "")), []).append(node)
    for thread_id, thread_nodes in by_thread.items():
        if not thread_id or len(thread_nodes) < 2:
            continue
        for left, right in zip(thread_nodes, thread_nodes[1:]):
            key = (str(left.get("id")), str(right.get("id")), "same_thread")
            if key in seen:
                continue
            seen.add(key)
            edges.append(
                {
                    "id": f"edge:{len(edges) + 1:04d}",
                    "from": left.get("id"),
                    "to": right.get("id"),
                    "type": "same_thread",
                    "confidence": "heuristic",
                    "reason": f"Consecutive entries in {thread_id}.",
                    "evidence_refs": [left["source_entry_refs"][0], right["source_entry_refs"][0]],
                }
            )
    for index, left in enumerate(nodes):
        for right in nodes[index + 1 :]:
            shared_artifacts = shared_values(left.get("artifact_refs", []), right.get("artifact_refs", []))
            if not shared_artifacts:
                continue
            key = (str(left.get("id")), str(right.get("id")), "touches_artifact")
            if key in seen:
                continue
            seen.add(key)
            edges.append(
                {
                    "id": f"edge:{len(edges) + 1:04d}",
                    "from": left.get("id"),
                    "to": right.get("id"),
                    "type": "touches_artifact",
                    "confidence": "heuristic",
                    "reason": "Entries reference shared artifact(s): " + ", ".join(shared_artifacts[:3]),
                    "artifact_refs": shared_artifacts,
                    "evidence_refs": [left["source_entry_refs"][0], right["source_entry_refs"][0]],
                }
            )
    return edges


def write_decision_index(
    vault: Path,
    slug: str,
    entries: list[dict[str, Any]],
    artifacts: list[dict[str, Any]],
    artifact_path: str | None,
    path: Path,
) -> dict[str, Any]:
    nodes = build_decision_nodes_from_entries(entries, slug, artifacts)
    source_paths = dedupe([
        str(entry.get("_source_path", ""))
        for entry in entries
        if isinstance(entry.get("_source_path"), str)
    ])
    source: dict[str, Any] = {
        "kind": "roadmap",
        "raw_entry_count": len(entries),
        "raw_glob": str(vault / "raw" / "weeks" / "*" / f"{slug}.json"),
        "raw_paths": source_paths,
        "node_count": len(nodes),
    }
    if artifact_path:
        source["artifact_index_path"] = artifact_path
        source["artifact_index_use"] = "navigation_and_edge_hints_only"
    index = {
        "schema_version": "lode.decision_replay.v1",
        "project_slug": slug,
        "generated_at": dt.datetime.now(dt.timezone.utc).astimezone().isoformat(timespec="seconds"),
        "source": source,
        "nodes": nodes,
        "edges": build_edges(nodes),
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return index


def rebuild_decision_context(
    vault: Path,
    slug: str,
    entries: list[dict[str, Any]],
    artifacts: list[dict[str, Any]],
    artifact_path: str | None,
    limit: int,
    path: Path,
    status: dict[str, Any],
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    try:
        index = write_decision_index(vault, slug, entries, artifacts, artifact_path, path)
        status["index_generated_at"] = index.get("generated_at")
        nodes = [item for item in index.get("nodes", []) if isinstance(item, dict)]
    except OSError as exc:
        status["write_error"] = str(exc)
        nodes = build_decision_nodes_from_entries(entries, slug, artifacts)
    nodes.sort(
        key=lambda item: (
            str(item.get("timestamp", "")),
            str(item.get("id", "")),
        ),
        reverse=True,
    )
    return nodes[:limit], status


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


def read_artifacts(vault: Path, slug: str) -> tuple[list[dict[str, Any]], list[dict[str, str]], str | None]:
    path = vault / "raw" / "artifacts" / f"{slug}.json"
    artifacts = read_json_array(path)
    missing: list[dict[str, str]] = []
    for artifact in artifacts:
        path_value = artifact.get("path")
        if isinstance(path_value, str) and not Path(path_value).expanduser().exists():
            missing.append({
                "artifact_id": str(artifact.get("id", "")),
                "path": path_value,
            })
    return artifacts, missing, str(path) if path.exists() else None


def read_decision_context(
    vault: Path,
    slug: str,
    entries: list[dict[str, Any]],
    artifacts: list[dict[str, Any]],
    artifact_path: str | None,
    limit: int,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    path = vault / "raw" / "decisions" / f"{slug}.json"
    raw_latest = max_entry_datetime(entries)
    status: dict[str, Any] = {
        "path": str(path),
        "rebuilt": False,
        "reason": "current",
        "raw_latest_timestamp": raw_latest.isoformat() if raw_latest else None,
    }
    data: Any = None
    reason = "missing_index"
    generated_at: dt.datetime | None = None
    if not path.exists():
        status["reason"] = reason
        status["rebuilt"] = True
        return rebuild_decision_context(vault, slug, entries, artifacts, artifact_path, limit, path, status)
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        reason = "invalid_index_json"
        status["reason"] = reason
        status["rebuilt"] = True
        return rebuild_decision_context(vault, slug, entries, artifacts, artifact_path, limit, path, status)
    if isinstance(data, dict):
        generated_at = parse_datetime(data.get("generated_at"))
        status["index_generated_at"] = data.get("generated_at")
    if raw_latest is not None and (generated_at is None or generated_at < raw_latest):
        reason = "stale_index"
        status["reason"] = reason
        status["rebuilt"] = True
        return rebuild_decision_context(vault, slug, entries, artifacts, artifact_path, limit, path, status)
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        nodes = data.get("nodes")
        if isinstance(nodes, list):
            items = nodes
        else:
            value = data.get("decision_context")
            if isinstance(value, list):
                items = value
            else:
                items = []
    else:
        items = []

    decisions = [item for item in items if isinstance(item, dict)]
    if not decisions and entries:
        status["reason"] = "empty_index"
        status["rebuilt"] = True
        return rebuild_decision_context(vault, slug, entries, artifacts, artifact_path, limit, path, status)
    decisions.sort(
        key=lambda item: (
            str(item.get("timestamp", "")),
            str(item.get("id", "")),
        ),
        reverse=True,
    )
    return decisions[:limit], status


def add_decision_context(
    context: dict[str, Any],
    vault: Path,
    slug: str,
    entries: list[dict[str, Any]],
    artifacts: list[dict[str, Any]],
    artifact_path: str | None,
    limit: int,
) -> dict[str, Any]:
    decision_context, source = read_decision_context(vault, slug, entries, artifacts, artifact_path, limit)
    context["decision_context_source"] = source
    if decision_context:
        context["decision_context"] = decision_context
    return context


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
    recent_entries = [public_entry(entry) for entry in ranked[:limit]]
    artifacts, missing_artifacts, artifact_path = read_artifacts(vault, slug)
    context: dict[str, Any] = {
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
    return add_decision_context(context, vault, slug, entries, artifacts, artifact_path, limit)


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
