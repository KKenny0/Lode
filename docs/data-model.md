# Data Model

[Back to README](../README.md)

Tracework data is organized around one source-of-truth rule: raw records stay
raw, and every synthesized view must be traceable back to them.

## Storage Surfaces

| Surface | Owns | Examples |
|---|---|---|
| Project repo | Artifacts that evolve with implementation | `AGENTS.md`, design docs, prompt contracts, schema contracts |
| Vault raw layer | Machine-readable memory and indexes | `raw/weeks/`, `raw/decisions/`, `raw/artifacts/`, `raw/months/` |
| Vault wiki layer | Human-readable synthesis | `Daily Note.md`, `Work Diary/Weekly/`, `Work Diary/Monthly/` |
| Conversation fallback | Zero-config immediate value | Structured capture recap when no vault is configured |

## Vault Layout

```text
{vault}/
  raw/
    projects.json
    artifacts/
      {slug}.json
    decisions/
      {slug}.json
    weeks/
      YYYY-WNN/
        {slug}.json
    months/
      YYYY-MM/
        signals.json
        skeleton.json
  Daily Note.md
  Work Diary/
    Weekly/
    Monthly/
```

## Core Flow

```text
/tracework:capture -> raw/weeks/{week}/{slug}.json
/tracework:query   <- raw/decisions/{slug}.json + raw/weeks/
/tracework:recall  <- raw/weeks/ + raw/artifacts/ + raw/decisions/
/tracework:daily   <- raw/weeks/ + fallback git coverage
/tracework:weekly  <- raw/weeks/ + fallback git coverage
/tracework:monthly <- Daily Note.md + matching raw entries
/tracework:roadmap <- raw entries + decision indexes
```

Skills are independently triggered. The shared storage convention lets their
outputs compound.

## Raw Entries

Raw entries should preserve report-worthy signals:

- goal or state change
- report-ready boundary metadata in optional `reporting`
- decision and rationale
- rejected or deferred alternatives
- risk, open question, or follow-up
- artifact or source reference
- evidence boundary

Raw entries are append-only for practical purposes. If a later session changes
a decision, mitigates a risk, or invalidates an artifact, write a new entry.
Do not rewrite historical entries for a naming or positioning migration.

`reporting` is optional and additive. When present, reports should prefer it
over prose inference for outcome/progress/activity treatment, impact boundary,
evidence boundary, evidence gaps, module scope, work stream, carry-forward
signals, and hard signals. Final `O#`, `W#`, `D#`, and `E#` ids are still
report-local and are never stored in raw entries.

## Artifact Dossiers

`{vault}/raw/artifacts/{slug}.json` stores durable artifact dossiers. A dossier
should be independently readable enough to tell an agent what the artifact
covered, what it did not cover, which claims or decisions matter, what remains
open, when the source was last seen, and whether the original source is still
available.

Dossiers are not independently authoritative. They preserve navigation plus
recorded context; consumers still need raw entries or direct evidence before
presenting a claim as verified. The vault does not store full artifact content
or become a shadow document repository.

## Decision Index

`{vault}/raw/decisions/{slug}.json` is a derived index for query speed and
answerability. Its schema string is `tracework.decision_replay.v1`.

The index must point back to raw evidence through `source_entry_refs`. Those
refs prove where a claim was recorded. They do not, by themselves, prove that
the outcome was independently verified.

## Report-Local Traceability

Weekly and monthly reports can derive local trace ids:

```text
raw evidence -> D# decision/tradeoff -> W# work stream -> O# outcome/progress
O# outcome/progress -> W# stream -> D# decision/tradeoff -> E# evidence
```

These ids belong to the report only. They are not written back into raw schema
and do not require historical data migration.

Evidence levels:

- `verified`: raw record plus independently checkable evidence
- `recorded`: raw record with clear provenance but no independent proof
- `limited`: fallback, inference, conflict, or insufficient support

Commit counts, line counts, task counts, active days, and token counts are
coverage metadata. They cannot become outcomes on their own.
