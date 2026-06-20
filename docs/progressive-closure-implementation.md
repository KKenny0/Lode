# Progressive Closure Implementation Plan

## Status

- **Overall**: Implementation complete; agent-output evaluation pending
- **Approved narrative**:

  > 向上逐层收口，向下穿透核验。
  > Lode 把 AI 协作中的散乱工作，组织成可汇报、可核验的成果；需要追问时，可以沿着成果回到决策、取舍与证据。

- **English narrative**:

  > Roll work up for reporting. Drill down to verify.
  > Lode turns scattered work from AI collaboration into report-ready, verifiable outcomes. When questions arise, trace each outcome back to decisions, tradeoffs, and evidence.

## Goal

Add an evidence-backed reporting use case for technical professionals without replacing Lode's decision-replay positioning. Reports should roll raw work upward into outcomes while preserving a reverse path from every important claim to work streams, decisions, tradeoffs, and source evidence.

## Product Boundary

### In scope

- A shared 3+1 reporting contract for weekly and monthly outputs.
- Stronger capture guidance for outcome, impact, work-stream, and evidence quality.
- Query results that preserve direct evidence references and distinguish provenance from verification evidence.
- Pure-Chinese lexical retrieval for decision queries.
- Fruit Check rules that prevent activity metrics from being promoted into outcomes.
- Evidence and confidence visibility in daily notes and decision roadmaps.
- A secondary technical-workplace narrative across README, website, data-model, and repository guidance.
- Backward-compatible behavior for all existing raw entries and derived indexes.

### Out of scope

- A ninth `closure` skill or new command.
- A persistent outcome index, `outcome_id`, `outcome_threads`, or raw-schema migration.
- General workplace features such as meeting notes, approvals, CRM, performance scoring, or employee surveillance.
- Hosted services, accounts, telemetry, external APIs, or new credentials.
- Treating commits, changed lines, task counts, work days, logs, or tokens as outcomes by themselves.
- Backfilling or rewriting historical raw entries.
- A synthetic showcase presented as real output.
- Publishing packages, tags, or releases before a separate release approval.

## Reporting Contract

```text
Upward roll-up:
raw evidence -> D# decision/tradeoff -> W# work stream -> O# outcome/progress

Downward verification:
O# outcome -> W# supporting work -> D# decision/tradeoff -> E# evidence
```

### L1: Outcome or progress (`O#`)

- A concrete, observable state change.
- Honest status: `done`, `ongoing`, `risk`, or `decision`.
- Specific user, system, reliability, workflow, or planning impact.
- Evidence grade and links to supporting `W#` items.
- At most three headline outcomes in the report overview; overflow becomes clearly labeled supporting progress.

### L2: Work stream (`W#`)

- Goal and work completed or advanced.
- Concrete contribution to an `O#` claim.
- Current status, risks, and next action.
- Work that supports no outcome remains visible as exploration, maintenance, or activity.

### L3: Decision and tradeoff (`D#`)

- Trigger and motivation.
- Chosen approach.
- Rejected or deferred alternatives.
- Explicit or inferred confidence.
- Links to the `W#` or `O#` item it explains.

### +1: Evidence audit (`E#`)

- Raw entry timestamp and source location.
- Commit, test, eval, issue, document, typed source, or artifact source-of-truth reference when present.
- Evidence grade and any missing or inaccessible evidence.
- `source_entry_refs` identify provenance; they do not by themselves prove a claim.

### Evidence grades

- **verified**: an explicit raw record plus at least one independently checkable evidence/source reference.
- **recorded**: an explicit raw record with source provenance but no independent verification reference.
- **limited**: fallback-only, inferred, conflicting, or otherwise insufficient evidence; it cannot be presented as a verified outcome.

## Fruit Check

An outcome must satisfy all of the following:

1. **State change**: a deliverable became usable, a capability changed, a risk was demonstrably reduced, or a stage goal materially advanced.
2. **Impact**: the record says who or what changed as a result.
3. **Honest status**: ongoing work, risks, and decisions are not rewritten as completed delivery.
4. **Source path**: at least one raw entry supports the claim; `verified` additionally requires direct evidence.

The following never establish an outcome by themselves: commit count, changed lines, task count, active days, file count, document count, log volume, token usage, or generic phrases such as "completed optimization".

## Implementation Phases

### Phase 1 — Capture and verification foundation

- **Status**: Complete
- [x] Clarify `work_stream`, `summary`, `impact`, `status`, and evidence semantics in the canonical convention.
- [x] Add Fruit Check rules to capture.
- [x] Preserve `evidence_refs` in compact decision-query nodes.
- [x] Distinguish raw provenance from direct verification evidence in evidence strength and missing-evidence output.
- [x] Add CJK lexical retrieval without introducing a tokenizer dependency.
- [x] Route evidence-intent questions through existing query modes; do not add a new helper mode.
- [x] Add positive, negative, evidence-limited, stale-index, and pure-Chinese regression coverage.
- [x] Sync convention and decision-replay copies.

### Phase 2 — Weekly 3+1 reporting

- **Status**: Complete
- [x] Replace stream-goal overview with at most three outcome/progress claims.
- [x] Add report-local `O#`, `W#`, `D#`, and `E#` relationships to the analysis contract.
- [x] Require Fruit Check and evidence grades.
- [x] Keep fallback-only work as limited progress.
- [x] Replace the detached commit appendix with a claim-level evidence audit.
- [x] Preserve technical depth in `tech` mode while sharing the same 3+1 backbone with `report` mode.
- [x] Extend the public weekly benchmark.

### Phase 3 — Monthly roll-up and drill-down support

- **Status**: Complete
- [x] Put monthly outcomes before activity statistics.
- [x] Move task counts, active days, category counts, and code-size data into a coverage appendix labeled as non-outcome evidence.
- [x] Preserve outcome/progress/risk status and evidence gaps.
- [x] Let monthly synthesis consult matching raw entries as optional evidence enrichment without changing deterministic parsers.
- [x] Clarify that daily task completion markers and line counts are activity metadata.
- [x] Add confidence and evidence columns to roadmap decision points.
- [x] Preserve risks, open questions, next-month handoff, and candidate rules.

### Phase 4 — Public narrative and repository guidance

- **Status**: Complete
- [x] Add progressive closure as a secondary use case in Chinese and English README files.
- [x] Add the same bounded use case to Chinese and English website home, workflow, and skill pages.
- [x] Preserve decision replay as the primary product and first-use loop.
- [x] Document the reporting relationship in the data model.
- [x] Record the design decision in `AGENTS.md` and `CLAUDE.md`.
- [x] Do not add a fake or synthetic closure showcase under the existing `0 MOCKS` claim.

## Acceptance Criteria

### Functional

- [ ] A grounded generated example produces a complete `O1 -> W1 -> D1 -> E1` path.
- [ ] Every headline outcome maps to at least one work stream in a generated weekly and monthly output.
- [ ] Every generated `verified` outcome has raw provenance and at least one direct evidence reference.
- [x] Pure-Chinese raw content can be retrieved by a relevant pure-Chinese query.
- [x] An unrelated pure-Chinese query remains unanswerable.
- [x] An explicit raw entry without direct evidence remains answerable but is not graded strong/verified.
- [x] Old raw entries without optional fields remain readable and are downgraded honestly rather than enriched with invented facts.
- [ ] Fallback-only, ongoing, risk, and conflicting records cannot become completed outcomes in agent-authored reports.
- [ ] Activity metrics never appear as standalone headline outcomes in agent-authored reports.
- [ ] Generated weekly and monthly outputs preserve risks, open questions, and missing evidence.

### Compatibility

- [x] Raw JSON shape and storage paths remain unchanged.
- [x] Decision index and query schemas remain v1-compatible; new fields are additive.
- [x] Existing query, recall, roadmap, capture, slug-safety, and repair regressions continue to pass.
- [x] Canonical references and all skill-local copies are identical after sync.
- [x] No external service, credential, or data migration is required.

### Documentation and product boundary

- [x] Chinese copy uses the approved wording exactly.
- [x] English copy uses "Roll work up for reporting. Drill down to verify."
- [x] Decision replay remains the primary headline and first-use loop.
- [x] Copy targets developers, tech leads, and small technical teams rather than generic office work.
- [x] Documentation does not claim that references were actually verified unless Lode read and checked them.

### Repository quality

- [x] `git diff --check` passes.
- [x] CLI build, doctor, skill packaging checks, and regressions pass.
- [x] VitePress production build passes.
- [x] Package dry run contains only intended files.
- [x] Generated `cli/dist`, `cli/skills`, and site build output are not committed.
- [x] Final `git status --short` contains only intentional source changes.

## Verification Commands

```bash
bash scripts/sync-convention.sh
bash scripts/sync-decision-replay.sh
npm --prefix cli run test
npm --prefix cli run copy-skills
npm --prefix cli run check-skills
npm --prefix site run build
npm --prefix cli pack --dry-run
git diff --check
git status --short
```

## Verification Result

Implementation verification completed on 2026-06-20; isolated review verification refreshed on 2026-06-21:

- CLI build and doctor tests passed.
- Decision replay regression suite passed: 11 executable fixtures; 2 weekly agent-authored scenarios remain documented benchmark cases.
- All eight packaged skills passed copy and integrity checks.
- VitePress production build passed for both English and Chinese pages.
- `npm pack --dry-run` contained only the intended CLI assets, build output, and eight skills.
- Canonical convention and decision-replay files matched every bundled skill copy after sync.
- Generated build directories, dependency directories, and Python caches were removed after verification.

The deterministic suite validates capture/query/recall/roadmap helpers and
packaging. Weekly and monthly rendering remain agent-authored, so the unchecked
functional criteria above require a grounded dogfood run; documented benchmark
scenarios specify the contract but do not count as execution proof.

## Risks and Controls

| Risk | Control |
|---|---|
| Aspirational `impact` becomes a claimed outcome | Fruit Check; expected effects must remain explicitly prospective |
| Raw provenance is mistaken for direct proof | Separate provenance from evidence grade and `missing_evidence` |
| CJK n-grams create false positives | Shared tokenizer, minimum match threshold, and negative Chinese fixtures |
| `work_stream` names drift across sessions | Accept in v1; evaluate before adding persistent outcome relations |
| Reports hide conflicting evidence | Preserve conflicts and downgrade evidence rather than selecting the optimistic record |
| Canonical and bundled copies drift | Mandatory sync scripts plus `check-skills` |

## Rollback

- Revert the relevant phase without touching vault raw data.
- Re-run both sync scripts after reverting canonical files.
- Delete and rebuild derived decision indexes if query behavior changed.
- Rebuild the site after reverting public copy.
- Never rewrite or delete historical raw entries as part of rollback.

## Deferred Decisions

| Decision | Trigger to revisit | Owner |
|---|---|---|
| Persistent cross-week outcome IDs | Real weekly evaluations repeatedly split or merge outcomes incorrectly despite stable `work_stream` and `impact` | Maintainer/product review |
| Dedicated evidence query mode | Existing `impact -> why` routing cannot answer evidence-intent questions reliably | Maintainer/product review |
| Progressive-closure showcase | A real dogfood run produces a sanitizable end-to-end outcome/decision/evidence chain | Maintainer |
| Package/version release | Implementation passes review and the maintainer explicitly approves publishing | Maintainer |
