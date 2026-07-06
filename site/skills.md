# Skills

Tracework ships eight independent skills. They share one storage convention, so
each output can become evidence for later recall, query, brief, review, or
roadmap work.

## Start

### Cold Start Interview

**Trigger:** `/tracework:cold-start-interview`

Runs the first-time setup for Tracework: choose a local knowledge vault, set the
project identity, and save the preferences that future capture, recall, and
review skills will use.

### Capture

**Trigger:** `/tracework:capture`, `/tracework:capture checkpoint`, `收工`

Captures a session or checkpoint. It should preserve goals, state changes,
decisions, rejected paths, risks, source refs, artifact changes, and next steps.
Zero-config mode returns structured Markdown in the conversation.

### Recall

**Trigger:** `/tracework:recall`, `开工`

Reads recent raw entries, decision indexes, and artifact indexes to prepare the
next session. It should surface decisions, risks, open questions, abandoned
alternatives, and possibly stale artifacts.

## Ask

### Query

**Trigger:** `/tracework:query`, `why did we choose this?`, `为什么当时这么选`

Answers targeted project-history questions from local evidence. It distinguishes
provenance from verification: `source_entry_refs` show where something was
recorded, while direct evidence refs support stronger claims. If the record is
not enough, query should refuse to invent an answer.

### Roadmap

**Trigger:** `/tracework:roadmap`, `决策路线图`

Synthesizes decision threads, accumulating risks, recurring questions, and
revisited alternatives from raw entries and decision indexes.

## Review

### Daily

**Trigger:** `/tracework:daily`, `日报`

Writes a workplace-facing daily report from raw entries. Git history is used
only to fill coverage gaps, and the output keeps project, status, risk, next
step, and evidence-boundary fields stable for monthly review.

### Weekly

**Trigger:** `/tracework:weekly`, `周报`

Builds a weekly brief outline from raw entries first, with git as coverage and
fallback evidence only. Report-local `O#`, `W#`, `D#`, and `E#` chains make the
brief inspectable.

### Monthly

**Trigger:** `/tracework:monthly`, `月报`

Builds a monthly review from workplace daily reports and matching raw evidence.
Counts and activity metrics stay in coverage context, not outcome claims.
