<p align="center">
  <img src="assets/mark.svg" alt="Tracework" width="132" />
</p>

<h1 align="center">Tracework</h1>

<p align="center"><strong>Turn agent work into evidence-backed daily, weekly, and monthly reports.</strong></p>

<p align="center">
  <img src="assets/tracework-reporting-hero.webp" alt="Tracework turns scattered agent work into a clear, evidence-backed report that earns management confidence" width="1086" />
</p>

<p align="center">
  <a href="https://kkenny0.github.io/Tracework/"><strong>Documentation</strong></a> · <a href="https://kkenny0.github.io/Tracework/showcase">Showcase</a> · <a href="README.cn.md">中文</a>
</p>

Tracework continuously closes agent work into reports people can use, while
preserving enough local evidence to explain the decisions later.

Daily, Weekly, and Monthly are the high-frequency product surfaces. Capture is
the quiet evidence multiplier. Query, Recall, and Roadmap are lower-frequency
trust and recovery tools for the moments when work is questioned or resumed.

## Core Loop

```text
agent work
  -> capture the durable facts
  -> close the day
  -> form a weekly judgment
  -> review the monthly phase

when needed
  -> query why a choice was made
  -> recall where to continue
```

Tracework is reporting-first and decision-replay-backed. Reports can start from
git-only fallback coverage, but those claims stay `limited` until raw entries
explain intent, status, risks, trade-offs, and evidence boundaries.

## Reporting Scopes

Projects can declare a reporting group:

```yaml
profile:
  project_name: My Project
  reporting_group: work   # or personal, open-source, consulting...
```

Daily, Weekly, and Monthly partition scope before selecting headlines:

- `work`: workplace projects only; personal material is excluded everywhere.
- `personal`: personal projects only.
- `all`: a private combined view with separate judgments per group.

The normal three-headline budget applies per reporting group, not across the
whole vault. Remaining meaningful work stays visible in a portfolio section.

Upgrading from 0.2: existing projects without `reporting_group` become
`unassigned` and are excluded from scoped reports for safety. Run
`/tracework:cold-start-interview` once in each project or add the field manually.

## Skills

| Command | Role | Output |
| :--- | :--- | :--- |
| `/tracework:daily` | High-frequency closure | What changed today, why it matters, and the next gate |
| `/tracework:weekly` | High-frequency closure | Weekly management judgment; Markdown brief by default, slides when requested |
| `/tracework:monthly` | High-frequency review | Raw-first phase outcomes, recurring risks, and next-month closure targets |
| `/tracework:capture` | Evidence foundation | Adaptive lite/standard/deep raw session record |
| `/tracework:query` | Low-frequency trust | Cited answer to why a path was chosen |
| `/tracework:recall` | Low-frequency recovery | Bounded context for resuming older work |
| `/tracework:roadmap` | Advanced review | Long-range decision-thread narrative |
| `/tracework:cold-start-interview` | One-time setup | Vault, project identity, and reporting group |

Decision replay remains the trust mechanism: a later reader can drill from a
report claim to raw entries, rejected alternatives, risks, and direct evidence.
When the record is insufficient, Tracework should expose the gap instead of
inventing history.

Tracework is not a meeting-notes tool, approval workflow, performance packaging
layer, employee-monitoring surface, or generic office suite. Activity counts are
coverage metadata, not proof of outcomes.

## Install

### Codex

```bash
codex plugin marketplace add KKenny0/Tracework
codex plugin add tracework@tracework
```

### Claude Code

```bash
claude plugin marketplace add KKenny0/Tracework
claude plugin install tracework@tracework
```

## Storage

- Config: `~/.tracework/config.yaml` or `{project}/.tracework/config.yaml`
- Raw entries: `{vault}/raw/weeks/{week}/{slug}.json`
- Artifact dossiers: `{vault}/raw/artifacts/{slug}.json`
- Decision indexes: `{vault}/raw/decisions/{slug}.json`
- Human outputs: `{vault}/Daily Note.md` and `{vault}/Work Diary/`

Raw entries remain semantic truth. Decision indexes are rebuildable retrieval
views. Artifact dossiers preserve navigation and recorded scope, not shadow
copies of source documents.

## Development

```bash
npm --prefix cli run build
npm --prefix cli run copy-skills
npm --prefix cli run check-skills
npm --prefix cli run test
npm --prefix site run build
```

After editing `.codex-plugin/`, `skills/`, or `assets/`, run `copy-skills` before
`check-skills`. See [Configuration](docs/configuration.md),
[Data model](docs/data-model.md), and
[Artifact governance](docs/artifact-governance.md).

## Support

If Tracework helps you turn agent work into clearer reports while preserving
the evidence behind important decisions, you can support continued maintenance
here:

<https://kkenny0.github.io/support/>

Support helps maintain reporting quality, cross-runtime plugin packaging,
storage contracts, and documentation.

## License

MIT
