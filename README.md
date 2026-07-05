<p align="center">
  <img src="assets/mark.svg" alt="Tracework" width="132" />
</p>

<h1 align="center">Tracework</h1>

<p align="center"><strong>Turn agent sessions into evidence-backed work memory.</strong></p>

<p align="center">
  <a href="https://kkenny0.github.io/Tracework/"><strong>Documentation</strong></a> · <a href="https://kkenny0.github.io/Tracework/showcase">Showcase</a> · <a href="README.cn.md">中文</a>
</p>

Tracework gives agent work a trace that can be inspected, questioned, and
carried forward.

It captures the decisions, evidence, risks, artifacts, and next steps inside
agent sessions, then turns them into local records for recall, query, briefs,
reviews, and roadmaps.

## What Tracework Does

Tracework can:

- Capture session decisions, rejected paths, risks, artifacts, and next steps
- Answer why a path was chosen when local evidence supports it
- Recall useful context before a later session
- Roll raw session records into daily, weekly, monthly, or roadmap views
- Keep Markdown and JSON records in your own knowledge vault

The core loop stays small:

```text
capture session signals -> replay decisions -> brief, review, or roadmap
```

Decision replay is the trust mechanism: a later agent or reader can drill from
a claim back to raw entries, rejected alternatives, risks, and source refs. If
the record does not support an answer, Tracework should say so instead of
inventing history.

Tracework is not a meeting-notes tool, approval workflow, performance packaging
tool, employee-monitoring surface, or generic office suite. Activity counts are
coverage metadata, not proof of outcomes.

## Skills

| Command | When | Output |
| :--- | :--- | :--- |
| `/tracework:cold-start-interview` | First run | Configures the local vault and project profile |
| `/tracework:capture` | Wrap-up or checkpoint | Captures decisions, builds, investigations, repairs, risks, and artifacts |
| `/tracework:recall` | Session start | Recalls recent decisions, risks, open questions, and relevant artifacts |
| `/tracework:query` | Targeted follow-up | Answers "why did we choose this?" with cited local evidence |
| `/tracework:weekly` | Weekly | Rolls raw session records into a brief-ready outline |
| `/tracework:monthly` | Monthly | Builds a monthly review and candidate repeated rules |
| `/tracework:roadmap` | Phase review | Synthesizes a narrative decision history |
| `/tracework:daily` | Daily | Updates Obsidian-style daily notes from raw entries and git history |

The habit loop is intentionally small:

```text
/tracework:cold-start-interview once
收工 or /tracework:capture at session end
开工 or /tracework:recall at session start
/tracework:query when someone needs the why
```

Weekly, monthly, daily, and roadmap views compound after enough raw entries
exist. They are views over the same record, not a separate reporting database.

## Install

### Codex

```bash
codex plugin marketplace add KKenny0/Tracework
codex plugin add tracework@tracework
```

Update:

```bash
codex plugin marketplace upgrade tracework
codex plugin add tracework@tracework
```

### Claude Code

```bash
claude plugin marketplace add KKenny0/Tracework
claude plugin install tracework@tracework
```

Update:

```bash
claude plugin marketplace update tracework
claude plugin update tracework@tracework
```

## Storage

- Config: `~/.tracework/config.yaml` or `{project}/.tracework/config.yaml`
- Raw entries: `{vault}/raw/weeks/{week}/{slug}.json`
- Decision indexes: `{vault}/raw/decisions/{slug}.json`
- Human-readable outputs: `{vault}/Daily Note.md` and `{vault}/Work Diary/`

The public product, command, config, and schema namespace is `tracework`.
Tracework does not use legacy storage fallbacks; configure `knowledge_vault` in
one of the config files above.

## Development

```bash
npm --prefix cli run build
npm --prefix cli run copy-skills
npm --prefix cli run check-skills
npm --prefix cli run test
npm --prefix site run build
```

After editing `.codex-plugin/`, `skills/`, or `assets/`, run:

```bash
npm --prefix cli run copy-skills
npm --prefix cli run check-skills
```

Before releasing a user-visible plugin update:

1. Bump the plugin version in `.codex-plugin/plugin.json`,
   `.claude-plugin/plugin.json`, and `.claude-plugin/marketplace.json`.
2. Run `npm --prefix cli run copy-skills` so `plugins/tracework` mirrors the
   source manifests, skills, and assets.
3. Run `npm --prefix cli run check-skills` and `npm --prefix cli run test`.
4. Run `claude plugin validate .claude-plugin/plugin.json` and
   `claude plugin validate .claude-plugin/marketplace.json`.
5. Run `claude plugin tag --dry-run .` from a clean worktree before creating the
   release tag.

Core docs:

- [Configuration](docs/configuration.md)
- [Data model](docs/data-model.md)
- [Artifact governance](docs/artifact-governance.md)

## License

MIT
