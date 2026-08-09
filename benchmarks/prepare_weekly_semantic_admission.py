#!/usr/bin/env python3
"""Build a private Weekly semantic-admission experiment from existing raw fields."""

from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path
import re
from typing import Any


METRIC_PATTERNS = (
    re.compile(r"(?<!\w)[+-]?\d+(?:\.\d+)?%?\s*(?:→|->|=>|到|至|to)\s*[+-]?\d+(?:\.\d+)?%?", re.I),
    re.compile(r"(?<!\w)\d+\s*/\s*\d+(?!\w)"),
    re.compile(r"(?<!\w)[+-]?\d+(?:\.\d+)?%"),
)

VALID_TREATMENTS = {"body", "portfolio", "explicit_exclusion"}
VALID_COMMITMENT_RESOLUTIONS = {"met", "advanced", "blocked", "replanned", "not_started"}
EFFICIENCY_THRESHOLD = 0.5
REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INSTRUCTION_FILES = (
    REPO_ROOT / "skills" / "weekly" / "SKILL.md",
    REPO_ROOT / "skills" / "weekly" / "references" / "weekly-analysis-contract.md",
    REPO_ROOT / "skills" / "weekly" / "references" / "slide-template.md",
)


def non_empty(value: Any) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def metric_signals(entry: dict[str, Any]) -> list[str]:
    text = json.dumps(
        [entry.get("summary"), entry.get("impact"), entry.get("context")],
        ensure_ascii=False,
    )
    matches: list[str] = []
    for pattern in METRIC_PATTERNS:
        matches.extend(match.group(0).strip() for match in pattern.finditer(text))
    return list(dict.fromkeys(matches))


def entry_after_cutoff(timestamp: str, cutoff: str | None) -> bool:
    if not cutoff:
        return False
    value = dt.datetime.fromisoformat(timestamp)
    boundary = dt.datetime.fromisoformat(cutoff)
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", cutoff):
        return value.date() > boundary.date()
    if value.tzinfo is not None and boundary.tzinfo is None:
        value = value.replace(tzinfo=None)
    elif value.tzinfo is None and boundary.tzinfo is not None:
        value = value.replace(tzinfo=boundary.tzinfo)
    return value > boundary


def semantic_card(entry: dict[str, Any], index: int, slug: str) -> dict[str, Any]:
    reporting = entry.get("reporting") if isinstance(entry.get("reporting"), dict) else {}
    outcome = reporting.get("outcome_candidate")
    outcome_statement = outcome.get("statement") if isinstance(outcome, dict) else None
    transition = entry.get("lifecycle_transition")
    work_stream = (
        reporting.get("work_stream")
        or entry.get("work_stream")
        or (transition.get("subject") if isinstance(transition, dict) else None)
        or "ungrouped"
    )
    open_questions = entry.get("open_questions") if isinstance(entry.get("open_questions"), list) else []
    boundary = (
        non_empty(reporting.get("evidence_gap"))
        or next((non_empty(item) for item in open_questions if non_empty(item)), None)
        or "未记录独立验证边界"
    )
    source_types = [entry.get("source")]
    source_types.extend(
        ref.get("type")
        for ref in entry.get("source_refs", [])
        if isinstance(ref, dict)
    )
    card: dict[str, Any] = {
        "locator": {"project_slug": slug, "entry_index": index},
        "timestamp": entry.get("timestamp"),
        "work_stream": work_stream,
        "why_signal": non_empty(entry.get("motivation")) or "目标未记录",
        "result_signal": non_empty(outcome_statement) or non_empty(entry.get("impact")) or entry.get("summary"),
        "meaning_signal": non_empty(entry.get("impact")) or "影响未记录",
        "truth_boundary": {
            "impact": reporting.get("impact_boundary", "unknown"),
            "evidence": reporting.get("evidence_boundary", "limited"),
            "remaining_gate": boundary,
        },
        "proof_hints": {
            "metrics": metric_signals(entry),
            "source_types": list(dict.fromkeys(item for item in source_types if isinstance(item, str))),
            "status": entry.get("status", "unknown"),
        },
    }
    return card


def extract_prior_commitments(markdown: str) -> str:
    lines = markdown.splitlines()
    candidates = [
        index
        for index, line in enumerate(lines)
        if re.match(r"^#{2,4}\s+", line)
        and re.search(r"下周|next[- ]?(?:week|period)", line, re.I)
        and not re.search(r"来源|证据|source|evidence|appendix", line, re.I)
    ]
    if not candidates:
        return ""
    start = candidates[-1]
    level = len(lines[start]) - len(lines[start].lstrip("#"))
    end = len(lines)
    for index in range(start + 1, len(lines)):
        match = re.match(r"^(#{1,%d})\s+" % level, lines[index])
        if match:
            end = index
            break
    return "\n".join(lines[start:end]).strip()


def validate_admission_treatment(
    cards: list[dict[str, Any]],
    coverage: dict[str, dict[str, Any]],
    *,
    material_body_indexes: set[int],
    prior_obligation_ids: set[str],
    commitment_accounting: dict[str, str],
) -> None:
    """Validate an eval ledger; classification alone is not semantic coverage."""
    expected_indexes = {str(index) for index in range(len(cards))}
    if set(coverage) != expected_indexes:
        raise ValueError("coverage must classify every admission card exactly once")
    for index, item in coverage.items():
        if item.get("treatment") not in VALID_TREATMENTS:
            raise ValueError(f"card {index} has an invalid treatment")
    for index in material_body_indexes:
        if str(index) not in expected_indexes:
            raise ValueError(f"material card {index} does not exist")
        if coverage[str(index)]["treatment"] != "body":
            raise ValueError(f"material card {index} must remain in the main narrative")

    if set(commitment_accounting) != prior_obligation_ids:
        raise ValueError("every prior commitment must be accounted for exactly once")
    for obligation_id, resolution in commitment_accounting.items():
        if resolution not in VALID_COMMITMENT_RESOLUTIONS:
            raise ValueError(f"prior commitment {obligation_id} has an invalid resolution")


def validate_admission_ledger_files(
    cards: list[dict[str, Any]],
    ledger_file: Path,
    oracle_file: Path,
) -> None:
    ledger = json.loads(ledger_file.read_text(encoding="utf-8"))
    oracle = json.loads(oracle_file.read_text(encoding="utf-8"))
    if not isinstance(ledger, dict) or not isinstance(oracle, dict):
        raise ValueError("ledger and oracle must be JSON objects")
    for field in ("material_body_indexes", "prior_obligation_ids"):
        if field not in oracle or not isinstance(oracle[field], list):
            raise ValueError(f"oracle must define {field} as a list")
    coverage = ledger.get("coverage")
    accounting = ledger.get("commitment_accounting")
    if not isinstance(coverage, dict) or not isinstance(accounting, dict):
        raise ValueError("ledger must define coverage and commitment_accounting objects")
    validate_admission_treatment(
        cards,
        coverage,
        material_body_indexes=set(oracle["material_body_indexes"]),
        prior_obligation_ids=set(oracle["prior_obligation_ids"]),
        commitment_accounting=accounting,
    )


def comparable_cost_metrics(
    *,
    instruction_chars: int,
    admission_chars: int,
    reopened_source_chars: int,
    full_raw_chars: int,
    full_prior_chars: int,
) -> dict[str, Any]:
    counts = {
        "instruction_chars": instruction_chars,
        "admission_chars": admission_chars,
        "reopened_source_chars": reopened_source_chars,
        "full_raw_chars": full_raw_chars,
        "full_prior_chars": full_prior_chars,
    }
    for name, value in counts.items():
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            raise ValueError(f"{name} must be a non-negative integer")
    evidence_source_chars = admission_chars + reopened_source_chars
    baseline_evidence_chars = full_raw_chars + full_prior_chars
    comparable_input_chars = instruction_chars + evidence_source_chars
    comparable_baseline_chars = instruction_chars + baseline_evidence_chars
    reduction = round(
        1 - comparable_input_chars / comparable_baseline_chars, 4
    ) if comparable_baseline_chars else None
    return {
        "instruction_chars": instruction_chars,
        "admission_chars": admission_chars,
        "reopened_source_chars": reopened_source_chars,
        "evidence_source_input_chars": evidence_source_chars,
        "baseline_evidence_source_chars": baseline_evidence_chars,
        "comparable_total_input_chars": comparable_input_chars,
        "comparable_baseline_input_chars": comparable_baseline_chars,
        "evidence_source_reduction": round(
            1 - evidence_source_chars / baseline_evidence_chars, 4
        ) if baseline_evidence_chars else None,
        "comparable_total_input_reduction": reduction,
        "efficiency_gate": {
            "threshold": EFFICIENCY_THRESHOLD,
            "result": "passed" if reduction is not None and reduction >= EFFICIENCY_THRESHOLD else "failed",
        },
    }


def build_admission(
    raw_file: Path,
    *,
    slug: str,
    cutoff: str | None,
    previous_weekly: Path | None = None,
    instruction_files: list[Path] | None = None,
    reopened_source_files: list[Path] | None = None,
) -> dict[str, Any]:
    raw_text = raw_file.read_text(encoding="utf-8")
    data = json.loads(raw_text)
    entries = data if isinstance(data, list) else [data]
    cards = [
        semantic_card(entry, index, slug)
        for index, entry in enumerate(entries)
        if isinstance(entry, dict)
        and isinstance(entry.get("timestamp"), str)
        and not entry_after_cutoff(entry["timestamp"], cutoff)
    ]
    prior_text = ""
    previous_source_chars = 0
    if previous_weekly is not None:
        previous_text = previous_weekly.read_text(encoding="utf-8")
        previous_source_chars = len(previous_text)
        prior_text = extract_prior_commitments(previous_text)
    resolved_instruction_files = tuple(instruction_files) if instruction_files is not None else DEFAULT_INSTRUCTION_FILES
    if not resolved_instruction_files:
        raise ValueError("mandatory Weekly instruction files cannot be empty")
    instruction_chars = sum(len(path.read_text(encoding="utf-8")) for path in resolved_instruction_files)
    reopened_source_chars = sum(
        len(path.read_text(encoding="utf-8")) for path in reopened_source_files or []
    )
    model_input: dict[str, Any] = {
        "usage_contract": {
            "purpose": "Select audience-relevant goal lanes before reopening raw evidence.",
            "main_narrative": "Use why_signal, result_signal, meaning_signal, and truth_boundary.",
            "proof_boundary": "proof_hints rank confidence only; do not copy coding details into slides.",
            "coverage": "Classify every card, then separately verify material lanes and prior commitments; classification alone is not completeness.",
        },
        "as_of": cutoff,
        "cards": cards,
        "prior_commitments": prior_text,
    }
    admission_chars = len(json.dumps(model_input, ensure_ascii=False, separators=(",", ":")))
    return {
        "model_input": model_input,
        "metrics": {
            "raw_source_chars": len(raw_text),
            "raw_entries_seen": len(entries),
            "cards_emitted": len(cards),
            "prior_weekly_source_chars": previous_source_chars,
            "prior_commitment_chars": len(prior_text),
            **comparable_cost_metrics(
                instruction_chars=instruction_chars,
                admission_chars=admission_chars,
                reopened_source_chars=reopened_source_chars,
                full_raw_chars=len(raw_text),
                full_prior_chars=previous_source_chars,
            ),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare an internal Weekly semantic-admission experiment")
    parser.add_argument("--raw-file", required=True)
    parser.add_argument("--slug", required=True)
    parser.add_argument("--as-of")
    parser.add_argument("--previous-weekly")
    parser.add_argument("--reopened-source-file", action="append", default=[])
    parser.add_argument("--ledger-file")
    parser.add_argument("--oracle-file")
    args = parser.parse_args()
    result = build_admission(
        Path(args.raw_file),
        slug=args.slug,
        cutoff=args.as_of,
        previous_weekly=Path(args.previous_weekly) if args.previous_weekly else None,
        reopened_source_files=[Path(path) for path in args.reopened_source_file],
    )
    if bool(args.ledger_file) != bool(args.oracle_file):
        parser.error("--ledger-file and --oracle-file must be supplied together")
    if args.ledger_file:
        validate_admission_ledger_files(
            result["model_input"]["cards"],
            Path(args.ledger_file),
            Path(args.oracle_file),
        )
    print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    return 0 if result["metrics"]["efficiency_gate"]["result"] == "passed" else 2


if __name__ == "__main__":
    raise SystemExit(main())
