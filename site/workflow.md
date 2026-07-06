# Workflow

## Minimal Loop

```text
install -> configure -> generate a report or query -> capture key sessions
```

1. Install the plugin as `tracework@tracework`.
2. Run `/tracework:cold-start-interview`.
3. Run `/tracework:daily`, `/tracework:weekly`, or a concrete
   `/tracework:query`.
4. End key sessions with `收工` or `/tracework:capture` so future reports and
   decision queries have stronger evidence.

This proves the core value quickly: reports can be useful immediately, while
captured sessions preserve the why that git history cannot recover.

## Reuse Map

```text
Capture -> raw/weeks/{week}/{slug}.json
Query   <- raw/decisions/ + raw/weeks/
Recall  <- raw/weeks/ + raw/artifacts/ + raw/decisions/
Daily   <- raw/weeks/ + fallback git coverage
Weekly  <- raw/weeks/ + fallback git coverage
Monthly <- Daily Note.md + matching raw entries
Roadmap <- raw entries + decision indexes
```

Skills are independent. There is no required pipeline. The shared storage
convention lets later views reuse earlier evidence.

Daily and weekly can run with no raw entries by using git fallback coverage.
Those outputs must stay `limited`: they can describe activity and progress, but
they must not invent motivation, trade-offs, risks, or verified impact.

## Progressive Closure

Briefs and reviews should roll work upward while preserving a route back down:

```text
upward: raw entries -> decisions -> work streams -> outcomes / risks / next steps
downward: outcome claim -> stream -> decision -> raw entry / evidence ref
```

Weekly and monthly outputs can use report-local labels:

- `O#`: outcome, progress, risk, or decision
- `W#`: supporting work stream
- `D#`: decision or tradeoff
- `E#`: evidence audit

These labels make a report inspectable. They do not change the raw schema.

## Zero-Config

Without a vault, capture can still return a structured recap in the
conversation. Configure a vault when you want quiet writes, cross-session
recall, decision query, and higher-quality brief/review outputs.

## Evidence Rules

- A source ref is provenance, not proof by itself.
- Git-only work is fallback evidence.
- Activity counts do not prove outcomes.
- Unsupported queries should return an evidence gap.
- New facts should be appended as new raw entries, not written into old records.
