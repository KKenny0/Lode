# Intent Sync Contract

Intent sync is a proposal-first workflow.

## Classifications

- **Fact**: directly supported by current files, raw entries, or explicit user
  statements.
- **Inference**: likely but not directly stated; must use hedging language.
- **Recommendation**: proposed doc/spec/rule update; requires approval before
  writing.

## Writable Targets

Common targets:

- `DESIGN.md`
- `PLAN.md`
- `AGENTS.md`
- `README.md`
- `README.cn.md`
- `.lode/config.yaml`
- docs containing `prompt`, `schema`, `contract`, `architecture`, or `design`
  in the filename.

Do not update generated output, eval fixtures, build artifacts, or unrelated
project docs.

## Lifecycle Signal Encoding

The first implementation records lifecycle changes as new raw entries:

- open question answered
- open question promoted to decision
- risk mitigated
- risk accepted
- decision revised
- decision superseded

Do not mutate historical raw entries.
