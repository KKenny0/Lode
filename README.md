<p align="center">
  <img src="logo.png" alt="Lode" width="180" />
</p>

<h1 align="center">Lode</h1>

<p align="center"><strong>Developer workflow memory for AI-assisted engineering work.</strong></p>
<p align="center">面向 AI 编程工作流的开发记忆系统。</p>
<p align="center"><a href="README.zh-CN.md">中文 README</a></p>

Lode turns the parts of development that usually disappear from chat history into durable local memory: intent, decisions, risks, architecture signals, and the reasoning behind changes. Git records **what changed**. Issue trackers record **planned work**. Lode records **what the developer and AI figured out while doing the work**, then reuses that memory to produce daily notes, weekly outlines, monthly reviews, and architecture materials.

The name comes from **lode**: a vein of ore where valuable mineral is concentrated. Commits, sessions, diffs, and code changes are the ore. Lode concentrates them into work knowledge worth keeping.

<p align="center">
  <img src="assets/lode-three-actions.png" alt="Lode workflow: Record, Synthesize, Review" width="860" />
</p>

## 10-Minute Loop

```bash
# 1. Install skills
npx skills add KKenny0/Lode -g --all

# 2. Configure vault path
mkdir -p ~/.lode
cat > ~/.lode/config.yaml <<EOF
knowledge_vault: /path/to/your/knowledge-vault
EOF

# 3. Verify
npx @lode/cli doctor
```

Then:

1. Work in any git repo.
2. At the end of a session, tell Claude Code: `收工`.
3. At the end of the week, tell it: `写本周周报`.

You can start without a project registry. Lode falls back to the current repo and writes structured raw entries into the vault.

## Who It Is For

Lode is a good fit if you:

- Work across multiple repos or long-lived engineering projects.
- Use AI assistants for implementation, debugging, refactoring, or documentation.
- Need weekly reports, monthly reviews, performance-review material, or project memory.
- Care about preserving decisions, trade-offs, risks, and architecture context.

Lode is not a good fit if you:

- Do not use git.
- Do not want to maintain a local knowledge vault.
- Only need an issue tracker or release-note generator.
- Never write daily notes, weekly reports, retrospectives, or project summaries.

## Skills

| Skill | Purpose | Trigger timing |
|---|---|---|
| `lode-session-recap` | Session-end change signal extraction | Per session, at wrap-up |
| `lode-arch-doc` | Stage implementation docs + pipeline architecture docs | After architectural work |
| `lode-git-daily-note` | Obsidian daily notes from raw entries and git history | Per day, on demand |
| `lode-weekly-outline` | Raw-first multi-project weekly PPT outline | Per week, on demand |
| `lode-monthly-review` | Monthly work review from daily notes | Per month, on demand |

The skills are independent. Lode is not a strict pipeline. Each skill can run on its own, but they share one local storage convention so downstream reports can reuse earlier work.

## Data Model

The knowledge vault has two layers:

```text
{vault}/
  raw/                            # Raw layer: structured intermediate data
    projects.json                 # Optional project registry
    weeks/
      2026-W18/
        storyboard-pipeline.json  # Raw change entries
    months/
      2026-04/
        signals.json
        skeleton.json
  Daily Note.md                   # Wiki layer: human-readable notes
  Work Diary/
    Weekly/
      2026-W18.md
    Monthly/
      2026-04.md
      2026-04.summary.md
```

Reusable flow:

```text
During development:
  lode-session-recap -> {vault}/raw/weeks/{week}/{slug}.json
  lode-arch-doc      -> {vault}/raw/weeks/{week}/{slug}.json

Daily:
  lode-git-daily-note <- raw entries + git log -> {vault}/Daily Note.md

Weekly:
  lode-weekly-outline <- raw entries + fallback git coverage -> weekly outline

Monthly:
  lode-monthly-review <- Daily Note.md -> monthly archive + summary
```

## Configuration

All skills use the same YAML config:

```yaml
# ~/.lode/config.yaml or {project}/.lode/config.yaml
knowledge_vault: /path/to/your/knowledge-vault
```

Resolution order:

1. Project `.lode/config.yaml`
2. `~/.lode/config.yaml`
3. `$WEEKLY_PPT_PATH`
4. `~/.weekly-ppt/`

`$WEEKLY_PPT_PATH` and `~/.weekly-ppt/` are legacy fallbacks. New setups should use `knowledge_vault`.

Run diagnostics after setup:

```bash
lode doctor
```

`lode doctor` checks config parsing, vault writability, skill installation, project slug resolution, temporary raw-entry writes, and weekly output directory creation.

## Privacy Model

Lode writes local Markdown and JSON files only. It does not add a remote service, account, sync backend, or hosted database. If your knowledge vault is a git repo, you control where it is pushed.

Your AI runtime may still see any context you ask it to process. Do not ask Lode skills to record secrets, credentials, private customer data, or anything that should not appear in your local vault.

## Examples

Synthetic examples live in [`examples/`](examples/). They use a fictional project, `storyboard-pipeline`, and are safe to publish. Start with:

- [`examples/raw-entry.json`](examples/raw-entry.json) — high-quality raw entry examples
- [`examples/projects.json`](examples/projects.json) — optional project registry
- [`examples/Daily Note.md`](<examples/Daily Note.md>) — daily note excerpt
- [`examples/weekly-outline.md`](examples/weekly-outline.md) — weekly outline sample
- [`examples/monthly-summary.md`](examples/monthly-summary.md) — monthly review sample
- [`examples/architecture-doc.md`](examples/architecture-doc.md) — stage/pipeline doc excerpt
- [`examples/vault/`](examples/vault/) — end-to-end synthetic vault layout

## Installation

### Via skills CLI

```bash
# Install all Lode skills (global, recommended)
npx skills add KKenny0/Lode -g --all

# Install specific skills
npx skills add KKenny0/Lode -g --skill lode-session-recap

# Install multiple skills
npx skills add KKenny0/Lode -g --skill lode-session-recap --skill lode-git-daily-note

# List available skills
npx skills add KKenny0/Lode -l

# Install to a specific agent (e.g. claude-code, codex)
npx skills add KKenny0/Lode -g -a claude-code --all
```

**Options:**

| Option | Description |
| --- | --- |
| `-g` | Global install to `~/<agent>/skills/` (recommended). Without it, installs to project `./<agent>/skills/` |
| `--skill <name>` | Install a specific skill. Repeatable |
| `--all` | Install all skills from the repo |
| `-a <agent>` | Target specific agents (e.g. `claude-code`, `codex`, `cursor`) |
| `-l` | List available skills without installing |

After installing skills, configure the vault path:

```bash
mkdir -p ~/.lode
cat > ~/.lode/config.yaml <<EOF
knowledge_vault: /path/to/your/knowledge-vault
EOF
```

Then run diagnostics:

```bash
npx @lode/cli doctor
```

### Alternative: git clone

```bash
git clone https://github.com/KKenny0/Lode.git ~/.claude/plugins/Lode
```

### From Source (Development)

```bash
npm --prefix cli install
npm --prefix cli run build
npm --prefix cli run copy-skills
node cli/dist/index.js setup
node cli/dist/index.js doctor
```

## Development

Important commands:

```bash
npm --prefix cli run build
npm --prefix cli run copy-skills
npm --prefix cli run check-skills
```

Design principles:

- **Self-contained skills**: each skill carries its own references so it can be installed individually.
- **Raw-first reporting**: weekly reports use raw entries as the primary semantic source; git is fallback and coverage evidence.
- **Graceful side effects**: when a raw write is only a side effect, failures do not block the primary deliverable.
- **Deterministic helpers**: scripts handle path resolution, date calculation, parsing, and aggregation where consistency matters.
- **Local evals, public protocols**: local fixtures stay ignored; public benchmark guidance lives under [`benchmarks/`](benchmarks/).

## Benchmarks

Public benchmark protocols document the quality bar without publishing local fixtures:

- [`benchmarks/README.md`](benchmarks/README.md)
- [`benchmarks/weekly-outline.md`](benchmarks/weekly-outline.md)

## License

MIT
