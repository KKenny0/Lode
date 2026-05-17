# Artifact Governance

[Back to README](../README.md)

Lode keeps durable artifacts local and close to the code. The knowledge vault
stores indexes and report outputs, not full copies of every project document.
This keeps decision replay dependency-light while still making important
artifacts discoverable.

The governance rule is simple: preserve enough provenance for
`/lode:capture -> /lode:query` first. `recall`, `roadmap`, weekly, and monthly
outputs can reuse that provenance later, but they should not require duplicating
repo-local documents into the vault.

## Storage Surfaces

| Surface | Owns | Examples |
|---|---|---|
| Project repo | Code-adjacent artifacts that should change with implementation | `DESIGN.md`, `PLAN.md`, `AGENTS.md`, architecture notes, prompt/schema contracts |
| Vault raw layer | Machine-readable memory and indexes | `raw/weeks/`, `raw/decisions/`, `raw/artifacts/`, `raw/months/` |
| Vault wiki layer | Human-readable synthesis | Daily Note, weekly outline, monthly review, decision roadmap |
| Conversation fallback | Zero-config immediate output | Structured `/lode:capture` recap when no vault is configured |

## Primary Replay Path

The first complete loop is:

```text
capture one session -> query one decision
```

For that loop to work, capture-owned entries should preserve:

- the decision or change under discussion;
- the path chosen and alternatives rejected or deferred;
- the rationale, constraints, risks, and open questions;
- references to raw entries or durable artifacts that support the answer.

Later outputs should read this evidence instead of asking users to maintain a
parallel report-specific memory.

## Artifact Index

`{vault}/raw/artifacts/{slug}.json` is a navigation layer. It should identify:

- where the durable artifact lives in the project repo;
- which topics, decision threads, risks, or open questions it covers;
- whether it is active, superseded, obsolete, or missing;
- when recall, roadmap, weekly, or monthly output should read it.

The index should not become a second copy of the artifact. Full content stays
in the project repo unless the artifact is itself a vault wiki output.

## Decision Replay Index

`{vault}/raw/decisions/{slug}.json` is a derived evidence pack for
`/lode:query`. It should point back to raw evidence through `source_entry_refs`
and summarize:

- the chosen path;
- alternatives rejected or deferred;
- rationale and constraints;
- impact, risks, and open questions;
- evidence gaps when the record is incomplete.

Weekly raw entries remain the source of truth. If a decision pack is missing or
has insufficient evidence, `/lode:query` should say there is no supported
answer instead of guessing.

## Roadmap Storage

`/lode:roadmap` produces a human-readable decision narrative. With a vault, the
preferred location is `{vault}/Work Diary/Decision Roadmap*.md`. Without a
vault, the roadmap can be returned in the conversation.

The roadmap may use `raw/decisions/` for fast lookup, but it should still treat
weekly raw entries as authoritative evidence. New information should be added
as new raw entries or refreshed derived indexes, not by rewriting historical raw
records.
