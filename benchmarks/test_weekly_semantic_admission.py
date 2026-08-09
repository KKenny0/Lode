#!/usr/bin/env python3
"""Executable checks for the private Weekly semantic-admission experiment."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("prepare_weekly_semantic_admission.py")
SPEC = importlib.util.spec_from_file_location("weekly_semantic_admission", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def entry(timestamp: str, *, outcome: str = "A bounded result") -> dict:
    return {
        "timestamp": timestamp,
        "type": "feature",
        "summary": "S5 changed 309 -> 92 lines and passed 4/4 hooks",
        "context": "Implementation details and issue #123",
        "source": "session-recap",
        "status": "done",
        "motivation": "Make the responsibility independently evolvable.",
        "impact": "The responsibility is now isolated while behavior stays unchanged.",
        "reporting": {
            "work_stream": "architecture boundary",
            "outcome_candidate": {"kind": "progress", "statement": outcome},
            "impact_boundary": "expected",
            "evidence_boundary": "verified",
            "evidence_gap": "Real pipeline validation remains open.",
            "private_blob": "SECRET" * 1000,
        },
    }


class SemanticAdmissionTest(unittest.TestCase):
    def test_semantic_fields_lead_and_unknown_reporting_data_stays_out(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            raw = Path(directory) / "week.json"
            raw.write_text(json.dumps([
                entry("2026-07-31T12:00:00+08:00"),
                entry("2026-08-01T12:00:00+08:00", outcome="Future result"),
            ]), encoding="utf-8")

            result = MODULE.build_admission(raw, slug="project", cutoff="2026-07-31")

        self.assertEqual(len(result["model_input"]["cards"]), 1)
        card = result["model_input"]["cards"][0]
        self.assertEqual(card["why_signal"], "Make the responsibility independently evolvable.")
        self.assertEqual(card["result_signal"], "A bounded result")
        self.assertIn("309 -> 92", card["proof_hints"]["metrics"])
        self.assertNotIn("SECRET", json.dumps(result))
        self.assertEqual(
            result["metrics"]["instruction_chars"],
            sum(len(path.read_text(encoding="utf-8")) for path in MODULE.DEFAULT_INSTRUCTION_FILES),
        )

    def test_previous_weekly_ignores_appendix_plan_sources(self) -> None:
        markdown = """# Weekly
## Slide 1
Large technical history.
### 下周计划草稿
Old draft.
## Slide 5
More history.
### 下周收口目标
- Confirmed: close the gate.
## Appendix
### 下周计划来源
- raw:plan-source
"""
        extracted = MODULE.extract_prior_commitments(markdown)
        self.assertIn("Confirmed: close the gate", extracted)
        self.assertNotIn("Large technical history", extracted)
        self.assertNotIn("raw:plan-source", extracted)

    def test_comparable_cost_includes_mandatory_instructions(self) -> None:
        metrics = MODULE.comparable_cost_metrics(
            instruction_chars=53_167,
            admission_chars=23_826,
            reopened_source_chars=25_305,
            full_raw_chars=87_159,
            full_prior_chars=24_585,
        )

        self.assertEqual(metrics["evidence_source_input_chars"], 49_131)
        self.assertEqual(metrics["comparable_total_input_chars"], 102_298)
        self.assertEqual(metrics["comparable_total_input_reduction"], 0.3797)
        self.assertLess(metrics["comparable_total_input_reduction"], 0.5)
        self.assertEqual(metrics["efficiency_gate"]["result"], "failed")

        with self.assertRaisesRegex(ValueError, "reopened_source_chars"):
            MODULE.comparable_cost_metrics(
                instruction_chars=1,
                admission_chars=1,
                reopened_source_chars=-1,
                full_raw_chars=2,
                full_prior_chars=0,
            )

    def test_build_measures_full_payload_and_real_reopened_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            raw = root / "week.json"
            reopened = root / "source.md"
            instruction = root / "instruction.md"
            raw.write_text(json.dumps([entry("2026-07-31T12:00:00+08:00")]), encoding="utf-8")
            reopened.write_text("grounding", encoding="utf-8")
            instruction.write_text("mandatory", encoding="utf-8")
            result = MODULE.build_admission(
                raw,
                slug="project",
                cutoff="2026-07-31",
                instruction_files=[instruction],
                reopened_source_files=[reopened],
            )

        encoded = json.dumps(result["model_input"], ensure_ascii=False, separators=(",", ":"))
        self.assertEqual(result["metrics"]["admission_chars"], len(encoded))
        self.assertEqual(result["metrics"]["reopened_source_chars"], len("grounding"))

    def test_cli_exits_nonzero_when_comparable_efficiency_gate_fails(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            raw = root / "week.json"
            raw.write_text(json.dumps([entry("2026-07-31T12:00:00+08:00")]), encoding="utf-8")
            result = subprocess.run(
                [
                    sys.executable,
                    "-B",
                    str(SCRIPT),
                    "--raw-file", str(raw),
                    "--slug", "project",
                ],
                capture_output=True,
                text=True,
                check=False,
            )

        self.assertEqual(result.returncode, 2)
        self.assertEqual(json.loads(result.stdout)["metrics"]["efficiency_gate"]["result"], "failed")

    def test_material_lane_cannot_hide_behind_explicit_exclusion(self) -> None:
        cards = [{"work_stream": "quality"}, {"work_stream": "agent-native"}]
        coverage = {
            "0": {"treatment": "body"},
            "1": {"treatment": "explicit_exclusion"},
        }

        with self.assertRaisesRegex(ValueError, "material card 1"):
            MODULE.validate_admission_treatment(
                cards,
                coverage,
                material_body_indexes={0, 1},
                prior_obligation_ids=set(),
                commitment_accounting={},
            )

    def test_prior_commitment_cannot_disappear(self) -> None:
        cards = [{"work_stream": "quality"}, {"work_stream": "agent-native"}]
        coverage = {
            "0": {"treatment": "body"},
            "1": {"treatment": "body"},
        }

        with self.assertRaisesRegex(ValueError, "every prior commitment"):
            MODULE.validate_admission_treatment(
                cards,
                coverage,
                material_body_indexes={0, 1},
                prior_obligation_ids={"quality-attribution", "agent-native-phase-1"},
                commitment_accounting={"quality-attribution": "advanced"},
            )

    def test_cli_validates_candidate_ledger_against_independent_oracle(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            raw = root / "week.json"
            ledger = root / "ledger.json"
            oracle = root / "oracle.json"
            first = entry("2026-07-31T12:00:00+08:00")
            second = entry("2026-07-31T13:00:00+08:00", outcome="Agent-native progressed")
            first["raw_noise"] = "x" * 100_000
            second["raw_noise"] = "y" * 100_000
            raw.write_text(json.dumps([first, second]), encoding="utf-8")
            ledger.write_text(json.dumps({
                "coverage": {
                    "0": {"treatment": "body"},
                    "1": {"treatment": "explicit_exclusion"},
                },
                "commitment_accounting": {"agent-native-phase-1": "advanced"},
            }), encoding="utf-8")
            oracle.write_text(json.dumps({
                "material_body_indexes": [0, 1],
                "prior_obligation_ids": ["agent-native-phase-1"],
            }), encoding="utf-8")
            result = subprocess.run(
                [
                    sys.executable,
                    "-B",
                    str(SCRIPT),
                    "--raw-file", str(raw),
                    "--slug", "project",
                    "--ledger-file", str(ledger),
                    "--oracle-file", str(oracle),
                ],
                capture_output=True,
                text=True,
                check=False,
            )

            ledger.write_text(json.dumps({
                "coverage": {
                    "0": {"treatment": "body"},
                    "1": {"treatment": "body"},
                },
                "commitment_accounting": {"agent-native-phase-1": "advanced"},
            }), encoding="utf-8")
            accepted = subprocess.run(
                [
                    sys.executable,
                    "-B",
                    str(SCRIPT),
                    "--raw-file", str(raw),
                    "--slug", "project",
                    "--ledger-file", str(ledger),
                    "--oracle-file", str(oracle),
                ],
                capture_output=True,
                text=True,
                check=False,
            )

        self.assertNotEqual(result.returncode, 0)
        self.assertIn("material card 1", result.stderr)
        self.assertEqual(accepted.returncode, 0, accepted.stderr)


if __name__ == "__main__":
    unittest.main()
