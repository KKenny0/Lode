#!/usr/bin/env python3
"""Build a Decision Replay Index from Lode raw entries.

The index is derived from weekly raw entries only. Artifact metadata may help
connect entries, but it must not create decision facts.
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


SCHEMA_VERSION = "lode.decision_replay.v1"
QUERY_SCHEMA_VERSION = "lode.decision_query.v1"
SAFE_SLUG_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
EXPLICIT_FIELDS = (
    "motivation",
    "exploration_paths",
    "abandoned_alternatives",
    "open_questions",
)
STOPWORDS = {
    "about",
    "after",
    "again",
    "also",
    "and",
    "are",
    "because",
    "before",
    "between",
    "build",
    "built",
    "changed",
    "changes",
    "choose",
    "context",
    "decision",
    "did",
    "during",
    "entry",
    "for",
    "from",
    "have",
    "how",
    "into",
    "needed",
    "project",
    "rather",
    "replaced",
    "session",
    "should",
    "source",
    "that",
    "the",
    "their",
    "there",
    "these",
    "this",
    "through",
    "using",
    "was",
    "we",
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
    result: dict[str, Any] = {}
    for line in raw.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if line[:1].isspace() or ":" not in line:
            continue
        key, value = line.split(":", 1)
        value = value.strip()
        if not value or value in {"|", ">"}:
            continue
        if " #" in value:
            value = value.split(" #", 1)[0].rstrip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        result[key.strip()] = value
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
    sources = dedupe(sources)
    return cfg, sources


def slugify(value: str) -> str:
    slug = re.sub(r"[\s_]+", "-", value.strip().lower())
    slug = re.sub(r"[^a-z0-9-]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug or "project"


def validate_project_slug(slug: str) -> str:
    if not SAFE_SLUG_RE.fullmatch(slug):
        raise ValueError(
            "project slug must be a filename-safe value using letters, numbers, dots, underscores, or hyphens"
        )
    return slug


def same_path(left: str, right: Path) -> bool:
    left_path = Path(left).expanduser()
    right_path = right.expanduser()
    try:
        return left_path.resolve() == right_path.resolve()
    except OSError:
        return left_path.absolute() == right_path.absolute()


def project_slug(cwd: Path, vault: Path, configured: Any = None) -> str:
    if isinstance(configured, str) and configured.strip():
        return validate_project_slug(configured.strip())

    projects_file = vault / "raw" / "projects.json"
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
                            return validate_project_slug(slug_value)
        except json.JSONDecodeError:
            pass

    return validate_project_slug(slugify(cwd.resolve().name))


def load_json_array(path: Path) -> list[Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return [data]
    raise ValueError(f"expected JSON array or object: {path}")


def load_raw_entries(vault: Path, slug: str) -> tuple[list[dict[str, Any]], list[str]]:
    root = vault / "raw" / "weeks"
    if not root.exists():
        return [], []

    entries: list[dict[str, Any]] = []
    source_paths: list[str] = []
    for path in sorted(root.glob(f"*/{slug}.json")):
        raw_entries = load_json_array(path)
        source_paths.append(str(path))
        week = path.parent.name
        for index, entry in enumerate(raw_entries):
            if not isinstance(entry, dict):
                continue
            item = dict(entry)
            item["_source_path"] = str(path)
            item["_source_week"] = week
            item["_source_index"] = index
            entries.append(item)

    entries.sort(key=entry_sort_key)
    return entries, source_paths


def entry_sort_key(entry: dict[str, Any]) -> tuple[str, str, int]:
    timestamp = entry.get("timestamp")
    if not isinstance(timestamp, str):
        timestamp = ""
    return (timestamp, str(entry.get("_source_week", "")), int(entry.get("_source_index", 0)))


def load_artifacts(vault: Path, slug: str) -> tuple[list[dict[str, Any]], str | None]:
    path = vault / "raw" / "artifacts" / f"{slug}.json"
    if not path.exists():
        return [], None
    artifacts = [item for item in load_json_array(path) if isinstance(item, dict)]
    return artifacts, str(path)


def as_string_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [item.strip() for item in value if isinstance(item, str) and item.strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def as_object_list(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [dict(item) for item in value if isinstance(item, dict)]


def as_object(value: Any) -> dict[str, Any] | None:
    if isinstance(value, dict):
        return dict(value)
    return None


def text_value(entry: dict[str, Any], field: str) -> str | None:
    value = entry.get(field)
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def has_explicit_decision_signal(entry: dict[str, Any]) -> bool:
    if entry.get("type") == "decision" or entry.get("archetype") == "decision":
        return True
    if as_string_list(entry.get("decision_threads")):
        return True
    return any(as_string_list(entry.get(field)) or text_value(entry, field) for field in EXPLICIT_FIELDS)


def entry_ref(entry: dict[str, Any]) -> dict[str, Any]:
    return {
        "week": entry["_source_week"],
        "path": entry["_source_path"],
        "timestamp": entry.get("timestamp"),
        "entry_index": entry["_source_index"],
    }


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


def keyword_tokens(text: str) -> list[str]:
    tokens = [
        token
        for token in re.findall(r"[a-zA-Z][a-zA-Z0-9-]{2,}", text.lower())
        if token not in STOPWORDS and not token.isdigit()
    ]
    return dedupe(tokens)


def search_tokens(text: str) -> set[str]:
    tokens = set(keyword_tokens(text))
    for token in list(tokens):
        if "-" not in token or token.startswith("re-"):
            continue
        for part in token.split("-"):
            if len(part) >= 3 and part not in STOPWORDS and not part.isdigit():
                tokens.add(part)
    return tokens


def topic_keys(entry: dict[str, Any], artifact_thread_hints: list[str]) -> list[str]:
    keys: list[str] = []
    keys.extend(slugify(item) for item in as_string_list(entry.get("decision_threads")))
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
    if has_explicit_decision_signal(entry) and text_value(entry, "summary"):
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


def node_from_entry(
    entry: dict[str, Any], ordinal: int, slug: str, artifacts: list[dict[str, Any]]
) -> dict[str, Any]:
    artifact_ids, artifact_thread_hints = artifact_hints_for_entry(entry, artifacts)
    artifact_refs = dedupe([*artifact_refs_from_entry(entry), *artifact_ids])
    keys = topic_keys(entry, artifact_thread_hints)
    explicit = has_explicit_decision_signal(entry)
    why = text_value(entry, "motivation") or text_value(entry, "context")
    week = str(entry.get("_source_week", "unknown-week"))
    decision_threads = as_string_list(entry.get("decision_threads"))
    source_refs = as_object_list(entry.get("source_refs"))
    lifecycle_transition = as_object(entry.get("lifecycle_transition"))
    inference_notes = []
    if not explicit:
        inference_notes.append("Decision content inferred from summary/context because explicit decision fields were sparse.")
    node = {
        "id": f"{slug}:{week}:{ordinal:03d}",
        "timestamp": entry.get("timestamp"),
        "week": week,
        "confidence": "explicit" if explicit else "inferred",
        "source_entry_refs": [entry_ref(entry)],
        "summary": text_value(entry, "summary") or "Untitled raw entry",
        "decision": text_value(entry, "summary") or "Untitled raw entry",
        "why": why,
        "chosen": chosen_path(entry),
        "rejected": rejected_paths(entry),
        "open_questions": as_string_list(entry.get("open_questions")),
        "impact": text_value(entry, "impact"),
        "decision_threads": decision_threads,
        "lifecycle_transition": lifecycle_transition,
        "topic_keys": keys,
        "artifact_refs": artifact_refs,
        "evidence_refs": as_string_list(entry.get("evidence_refs")),
        "source_refs": source_refs,
        "thread_id": thread_id_for(keys, entry),
        "inference_notes": inference_notes,
    }
    return node


def build_nodes(
    entries: list[dict[str, Any]], slug: str, artifacts: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    nodes: list[dict[str, Any]] = []
    for entry in entries:
        if not isinstance(entry.get("summary"), str) or not isinstance(entry.get("context"), str):
            continue
        nodes.append(node_from_entry(entry, len(nodes) + 1, slug, artifacts))
    return nodes


def shared_values(left: list[str], right: list[str]) -> list[str]:
    return sorted(set(left).intersection(right))


def build_edges(nodes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    edges: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()

    by_thread: dict[str, list[dict[str, Any]]] = {}
    for node in nodes:
        by_thread.setdefault(str(node["thread_id"]), []).append(node)
    for thread_id, thread_nodes in by_thread.items():
        if len(thread_nodes) < 2:
            continue
        for left, right in zip(thread_nodes, thread_nodes[1:]):
            key = (left["id"], right["id"], "same_thread")
            if key in seen:
                continue
            seen.add(key)
            edges.append(
                {
                    "id": f"edge:{len(edges) + 1:04d}",
                    "from": left["id"],
                    "to": right["id"],
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
            key = (left["id"], right["id"], "touches_artifact")
            if key in seen:
                continue
            seen.add(key)
            edges.append(
                {
                    "id": f"edge:{len(edges) + 1:04d}",
                    "from": left["id"],
                    "to": right["id"],
                    "type": "touches_artifact",
                    "confidence": "heuristic",
                    "reason": "Entries reference shared artifact(s): " + ", ".join(shared_artifacts[:3]),
                    "artifact_refs": shared_artifacts,
                    "evidence_refs": [left["source_entry_refs"][0], right["source_entry_refs"][0]],
                }
            )

    return edges


def current_timestamp() -> str:
    return dt.datetime.now(dt.timezone.utc).astimezone().isoformat(timespec="seconds")


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


def latest_entry_datetime(entries: list[dict[str, Any]]) -> dt.datetime | None:
    parsed = [item for item in (parse_datetime(entry.get("timestamp")) for entry in entries) if item is not None]
    return max(parsed) if parsed else None


def index_is_current(index: dict[str, Any], entries: list[dict[str, Any]]) -> bool:
    latest_entry = latest_entry_datetime(entries)
    if latest_entry is None:
        return True
    generated_at = parse_datetime(index.get("generated_at"))
    return generated_at is not None and generated_at >= latest_entry


def build_index(vault: Path, slug: str, generated_at: str | None = None) -> dict[str, Any]:
    slug = validate_project_slug(slug)
    entries, raw_paths = load_raw_entries(vault, slug)
    artifacts, artifact_path = load_artifacts(vault, slug)
    nodes = build_nodes(entries, slug, artifacts)
    edges = build_edges(nodes)
    source: dict[str, Any] = {
        "kind": "roadmap",
        "raw_entry_count": len(entries),
        "raw_glob": str(vault / "raw" / "weeks" / "*" / f"{slug}.json"),
        "raw_paths": raw_paths,
        "node_count": len(nodes),
    }
    if artifact_path:
        source["artifact_index_path"] = artifact_path
        source["artifact_index_use"] = "navigation_and_edge_hints_only"
    return {
        "schema_version": SCHEMA_VERSION,
        "project_slug": slug,
        "generated_at": generated_at or current_timestamp(),
        "source": source,
        "nodes": nodes,
        "edges": edges,
    }


def write_index(index: dict[str, Any], vault: Path, slug: str, output: Path | None) -> Path:
    slug = validate_project_slug(slug)
    target = output or vault / "raw" / "decisions" / f"{slug}.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return target


def dedupe(values: list[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        normalized = value.strip()
        if not normalized or normalized in seen:
            continue
        result.append(normalized)
        seen.add(normalized)
    return result


def command_build(args: argparse.Namespace) -> int:
    cwd = Path(args.cwd).expanduser().resolve()
    cfg, config_sources = resolve_config(cwd)
    vault = Path(args.vault).expanduser().resolve() if args.vault else Path(str(cfg["knowledge_vault"]))
    slug = validate_project_slug(args.slug) if args.slug else project_slug(cwd, vault, cfg.get("project_slug"))
    output = Path(args.output).expanduser().resolve() if args.output else None
    index = build_index(vault, slug, args.generated_at)
    path = write_index(index, vault, slug, output)
    print(
        json.dumps(
            {
                "path": str(path),
                "project_slug": slug,
                "vault": str(vault),
                "config_sources": config_sources,
                "entries_read": index["source"]["raw_entry_count"],
                "nodes": len(index["nodes"]),
                "edges": len(index["edges"]),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


def load_index(vault: Path, slug: str) -> dict[str, Any]:
    slug = validate_project_slug(slug)
    path = vault / "raw" / "decisions" / f"{slug}.json"
    if path.exists():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            data = None
        if isinstance(data, dict):
            entries, _ = load_raw_entries(vault, slug)
            if index_is_current(data, entries):
                return data
            return build_index(vault, slug)
    return build_index(vault, slug)


def recent_decision_nodes(index: dict[str, Any], limit: int) -> list[dict[str, Any]]:
    nodes = [item for item in index.get("nodes", []) if isinstance(item, dict)]
    nodes.sort(
        key=lambda item: (
            str(item.get("timestamp", "")),
            str(item.get("id", "")),
        ),
        reverse=True,
    )
    return nodes[:limit]


def read_or_rebuild_decision_context(
    vault: Path,
    slug: str,
    limit: int,
    write: bool = True,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    slug = validate_project_slug(slug)
    path = vault / "raw" / "decisions" / f"{slug}.json"
    entries, _ = load_raw_entries(vault, slug)
    raw_latest = latest_entry_datetime(entries)
    status: dict[str, Any] = {
        "path": str(path),
        "rebuilt": False,
        "reason": "current",
        "raw_latest_timestamp": raw_latest.isoformat() if raw_latest else None,
    }

    def rebuild(reason: str) -> tuple[list[dict[str, Any]], dict[str, Any]]:
        status["reason"] = reason
        status["rebuilt"] = True
        index = build_index(vault, slug)
        status["index_generated_at"] = index.get("generated_at")
        if write:
            try:
                write_index(index, vault, slug, None)
            except OSError as exc:
                status["write_error"] = str(exc)
        return recent_decision_nodes(index, limit), status

    if not path.exists():
        return rebuild("missing_index")

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return rebuild("invalid_index_json")

    if isinstance(data, dict):
        status["index_generated_at"] = data.get("generated_at")
        if not index_is_current(data, entries):
            return rebuild("stale_index")
        nodes = data.get("nodes")
        if isinstance(nodes, list):
            items = nodes
        else:
            value = data.get("decision_context")
            items = value if isinstance(value, list) else []
    elif isinstance(data, list):
        items = data
        if entries:
            return rebuild("stale_index")
    else:
        items = []

    decisions = [item for item in items if isinstance(item, dict)]
    if not decisions and entries:
        return rebuild("empty_index")

    decisions.sort(
        key=lambda item: (
            str(item.get("timestamp", "")),
            str(item.get("id", "")),
        ),
        reverse=True,
    )
    return decisions[:limit], status


def node_search_text(node: dict[str, Any], mode: str) -> str:
    rejected_text = " ".join(
        " ".join(str(item.get(field, "")) for field in ("option", "reason"))
        for item in node.get("rejected", [])
        if isinstance(item, dict)
    )
    base = " ".join(
        str(value)
        for value in (
            node.get("decision"),
            node.get("summary"),
            node.get("why"),
            node.get("chosen"),
            node.get("impact"),
            rejected_text,
            " ".join(as_string_list(node.get("open_questions"))),
            " ".join(as_string_list(node.get("decision_threads"))),
            " ".join(as_string_list(node.get("topic_keys"))),
            " ".join(as_string_list(node.get("artifact_refs"))),
        )
        if value
    )
    if mode == "alternatives":
        base = f"{rejected_text} {base}"
    elif mode == "impact":
        base = f"{node.get('impact') or ''} {' '.join(as_string_list(node.get('artifact_refs')))} {base}"
    elif mode == "revisit":
        base = f"{rejected_text} {' '.join(as_string_list(node.get('open_questions')))} {base}"
    elif mode == "why":
        base = f"{node.get('why') or ''} {base}"
    return base.lower()


def query_terms(query: str) -> list[str]:
    return keyword_tokens(query)


def score_node(node: dict[str, Any], terms: list[str], mode: str) -> int:
    if not terms:
        return 0
    score = 0
    matched = matched_terms(node, terms, mode)
    required_matches = 1 if len(terms) == 1 else max(2, (len(terms) // 2) + 1)
    if len(matched) < required_matches:
        return 0
    score += len(matched) * 8
    for term in terms:
        if term in search_tokens(node_search_text(node, mode)):
            score += 10
        if term in search_tokens(" ".join(as_string_list(node.get("topic_keys")))):
            score += 8
        if term in search_tokens(str(node.get("decision", ""))):
            score += 6
        if term in search_tokens(str(node.get("why", ""))):
            score += 4
    if mode == "alternatives" and node.get("rejected"):
        score += 4
    if mode == "revisit" and (node.get("open_questions") or node.get("rejected")):
        score += 4
    if mode == "impact" and node.get("impact"):
        score += 4
    if mode == "why" and node.get("why"):
        score += 4
    if node.get("confidence") == "explicit":
        score += 2
    return score


def matched_terms(node: dict[str, Any], terms: list[str], mode: str) -> list[str]:
    haystack = search_tokens(node_search_text(node, mode))
    return [term for term in terms if term in haystack]


def compact_node(node: dict[str, Any], terms: list[str] | None = None, mode: str = "why") -> dict[str, Any]:
    result = {
        "id": node.get("id"),
        "timestamp": node.get("timestamp"),
        "week": node.get("week"),
        "confidence": node.get("confidence"),
        "decision": node.get("decision"),
        "why": node.get("why"),
        "chosen": node.get("chosen"),
        "rejected": node.get("rejected", []),
        "open_questions": node.get("open_questions", []),
        "impact": node.get("impact"),
        "decision_threads": node.get("decision_threads", []),
        "lifecycle_transition": node.get("lifecycle_transition"),
        "topic_keys": node.get("topic_keys", []),
        "thread_id": node.get("thread_id"),
        "artifact_refs": node.get("artifact_refs", []),
        "source_entry_refs": node.get("source_entry_refs", []),
        "source_refs": node.get("source_refs", []),
        "inference_notes": node.get("inference_notes", []),
    }
    if terms is not None:
        result["matched_terms"] = matched_terms(node, terms, mode)
    return result


def supporting_nodes(
    selected: list[dict[str, Any]], all_nodes: list[dict[str, Any]], edges: list[dict[str, Any]], limit: int
) -> list[dict[str, Any]]:
    selected_ids = {str(node.get("id")) for node in selected}
    wanted_ids: list[str] = []
    for edge in edges:
        left = str(edge.get("from"))
        right = str(edge.get("to"))
        if left in selected_ids and right not in selected_ids:
            wanted_ids.append(right)
        elif right in selected_ids and left not in selected_ids:
            wanted_ids.append(left)
    by_id = {str(node.get("id")): node for node in all_nodes}
    result = [by_id[node_id] for node_id in dedupe(wanted_ids) if node_id in by_id]
    return result[:limit]


def evidence_strength(top: list[dict[str, Any]], terms: list[str], mode: str) -> str:
    if not top:
        return "none"
    strongest = top[0]
    match_count = len(matched_terms(strongest, terms, mode))
    has_sources = bool(strongest.get("source_entry_refs"))
    if strongest.get("confidence") == "explicit" and has_sources and match_count >= max(2, min(len(terms), 3)):
        return "strong"
    if has_sources and match_count >= 2:
        return "moderate"
    return "weak"


def answerability_reason(top: list[dict[str, Any]], terms: list[str], mode: str, strength: str) -> str:
    if not terms:
        return "The query did not contain enough searchable decision terms."
    if not top:
        return "No decision index nodes matched enough query terms to ground an answer."
    top_node = top[0]
    matched = matched_terms(top_node, terms, mode)
    return (
        f"Top node {top_node.get('id')} matched {len(matched)}/{len(terms)} query terms "
        f"with {top_node.get('confidence', 'unknown')} confidence and {strength} evidence."
    )


def build_query_pack(index: dict[str, Any], query: str, mode: str, limit: int) -> dict[str, Any]:
    nodes = [node for node in index.get("nodes", []) if isinstance(node, dict)]
    edges = [edge for edge in index.get("edges", []) if isinstance(edge, dict)]
    terms = query_terms(query)
    scored = [
        (score_node(node, terms, mode), node)
        for node in nodes
    ]
    scored = [(score, node) for score, node in scored if score > 0]
    scored.sort(
        key=lambda item: (
            item[0],
            str(item[1].get("timestamp", "")),
        ),
        reverse=True,
    )
    top = [node for _, node in scored[:limit]]
    supporting = supporting_nodes(top, nodes, edges, max(limit, 1))
    top_matched_terms = dedupe([
        term
        for node in top
        for term in matched_terms(node, terms, mode)
    ])
    strength = evidence_strength(top, terms, mode)
    rejected: list[dict[str, Any]] = []
    open_questions: list[dict[str, Any]] = []
    docs: list[str] = []
    for node in top:
        for item in node.get("rejected", []):
            if isinstance(item, dict):
                rejected.append({"decision_id": node.get("id"), **item})
        for question in as_string_list(node.get("open_questions")):
            open_questions.append({"decision_id": node.get("id"), "question": question})
        docs.extend(as_string_list(node.get("artifact_refs")))
    return {
        "schema_version": QUERY_SCHEMA_VERSION,
        "project_slug": index.get("project_slug"),
        "generated_at": current_timestamp(),
        "query": query,
        "mode": mode,
        "answerable": bool(top),
        "terms": terms,
        "matched_terms": top_matched_terms,
        "evidence_strength": strength,
        "answerability_reason": answerability_reason(top, terms, mode, strength),
        "top_nodes": [compact_node(node, terms, mode) for node in top],
        "supporting_nodes": [compact_node(node, terms, mode) for node in supporting],
        "rejected_alternatives": rejected,
        "open_questions": open_questions,
        "missing_evidence": [] if top else ["No decision index nodes matched the query terms."],
        "suggested_docs": dedupe(docs),
    }


def command_query(args: argparse.Namespace) -> int:
    cwd = Path(args.cwd).expanduser().resolve()
    cfg, _ = resolve_config(cwd)
    vault = Path(args.vault).expanduser().resolve() if args.vault else Path(str(cfg["knowledge_vault"]))
    slug = validate_project_slug(args.slug) if args.slug else project_slug(cwd, vault, cfg.get("project_slug"))
    index = load_index(vault, slug)
    pack = build_query_pack(index, args.query, args.mode, max(args.limit, 1))
    print(json.dumps(pack, ensure_ascii=False, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Build a Lode Decision Replay Index")
    subparsers = parser.add_subparsers(dest="command", required=True)

    build_parser = subparsers.add_parser(
        "build",
        help="Build {vault}/raw/decisions/{slug}.json from weekly raw entries",
    )
    build_parser.add_argument("--cwd", default=os.getcwd(), help="Project working directory")
    build_parser.add_argument("--vault", help="Knowledge vault override")
    build_parser.add_argument("--slug", help="Project slug override")
    build_parser.add_argument("--output", help="Output path override")
    build_parser.add_argument("--generated-at", help="Generated timestamp override for deterministic fixtures")
    build_parser.set_defaults(func=command_build)

    query_parser = subparsers.add_parser(
        "query",
        help="Return a compact evidence pack from the decision replay index",
    )
    query_parser.add_argument("query", help="Decision question or keywords")
    query_parser.add_argument("--mode", choices=("why", "alternatives", "revisit", "impact"), default="why")
    query_parser.add_argument("--cwd", default=os.getcwd(), help="Project working directory")
    query_parser.add_argument("--vault", help="Knowledge vault override")
    query_parser.add_argument("--slug", help="Project slug override")
    query_parser.add_argument("--limit", type=int, default=5, help="Maximum top nodes")
    query_parser.set_defaults(func=command_query)
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
