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
