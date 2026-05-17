# Benchmarks

This directory publishes benchmark protocols and quality bars for Lode skills.

Local fixtures, transcripts, grader outputs, and workspace snapshots are intentionally
not committed. Keep them under ignored `skills/*/evals/` or `*-workspace/`
directories when running private evaluations.

## Run Records

For each local benchmark run, record:

- Date and model
- Repository commit SHA
- Skill version or local diff summary
- Scenario name
- Pass/fail for each assertion
- Short failure reason and output excerpt for failed assertions

## Public Protocols

- `weekly-outline.md` documents the quality bar for raw-first weekly outline generation.
- `regression-fixtures.json` lists public, synthetic regression scenarios for behavior that should not regress.
- `run-regression.mjs` executes fixture-backed checks. It currently runs
  decision replay, decision roadmap thread evidence, recall rebuild,
  unsafe-slug, and capture-helper repair gates end to end, then reports
  remaining agent-authored scenarios as documented-only protocols.

New roadmap and query skills should keep local eval fixtures under ignored
`skills/*/evals/` directories. Public benchmark writeups should describe the
behavioral contract only: recall quality, intent-sync safety, hard-stuff evidence
quality, and distillation overfitting safeguards.
