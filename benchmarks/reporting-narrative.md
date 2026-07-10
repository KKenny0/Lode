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
