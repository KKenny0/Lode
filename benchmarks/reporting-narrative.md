# Reporting Narrative Benchmark

Daily, Weekly, and Monthly are agent-authored, so evaluation has two layers.

## Executable Contract

`report-contract` fixtures verify:

- scope partition happens before selection;
- work output contains no configured personal terms;
- each group has its own judgment and headline budget;
- every meaningful stream appears in a headline or portfolio;
- next-period closure targets remain bounded.

These checks protect structure and audience safety. They do not claim to grade
prose quality.

## Real-Output Evaluation

For a dense real week, generate `work`, `personal`, and `all` views without
overwriting the source report. Review:

- Can the reader repeat the period judgment?
- Does each headline show starting situation, movement, end state, meaning, and
  remaining gate?
- Did personal work stay out of work output, including evidence refs?
- Did every meaningful non-headline stream remain in portfolio coverage?
- Can Daily be read in about one minute and Weekly presented in about five?
- Can every material claim drill into raw or direct evidence?

Record model, repo SHA, scope, output path, pass/fail, and short failure excerpts.
Keep private raw data and generated comparisons in ignored local eval folders or
temporary storage; do not commit them.

## End-to-End Admission

Run `npm --prefix cli test` and `npm --prefix cli run check-skills` first.
Report these independent boundaries instead of treating an aggregate green as
proof of usable prose:

| Layer | Pass condition |
|---|---|
| Preservation | Concurrent writes retain every entry; failed replacement retains original JSON; historical work reaches its correct period. |
| Independent consumption | Raw-only Monthly succeeds without Daily/Weekly or a derived index; absent evidence produces an honest empty state. |
| Claim support | No invented confirmed goals, expected effects as observed, vanished material risk, or silently confirmed proposals. |
| Reader value | A reader can repeat the change, remaining gate, and needed decision; material claims have source mappings. |
| Cost | Compare the same mode and evidence before/after, including every required instruction file, source reread, elapsed time, and manual correction count when actually measured. |

For semantic checks, use a small private set covering sparse evidence, late
cross-month capture, a replan, independent goals, and mixed groups. Name the
input period and scope exactly; a bounded sample is not full-week acceptance.
Assign expected material claims and unresolved gates from sources before writing
the candidate. Record exact failing sentences and revisions. Agent self-review
and actual reader acceptance are separate results; do not manufacture the latter.
Keep real inputs and outputs outside tracked public fixtures.
