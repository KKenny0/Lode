# Quick Start

## 1. Install

```bash
codex plugin marketplace add KKenny0/Lode
npx @lode/cli install-codex-plugin
```

## 2. Run the Demo

Run the deterministic replay fixture before setting up a vault:

```bash
node examples/decision-replay-demo.mjs
```

It prints the evidence-pack shape that `/lode:query` should return:
answerability metadata, the top decision node, raw source references, matched
terms, and rejected alternatives.

## 3. First Run

Run the cold-start interview once to configure Lode:

```
/lode:cold-start-interview
```

This creates `~/.lode/config.yaml` with your vault path, project identity, language, and report preferences.

## 4. Capture One Session

At the end of one real coding session, say:

```
收工
```

or run `/lode:capture`. Lode classifies the session archetype and captures what
matters: decisions, risks, abandoned paths, artifact changes, and source
references.

## 5. Query One Decision

After one captured session, ask a concrete question:

```
/lode:query why did we choose <the decision>?
```

The pass condition is a cited answer: matched decision node ids, `source_entry_refs`, rejected alternatives when they exist, and an explicit insufficient-evidence response when Lode has no supporting record.

## Later: Recall and Reports

Once there is history, start sessions with `开工` or `/lode:recall`. Use
`/lode:roadmap` when several decisions have accumulated. Use daily, weekly, and
monthly outputs when the raw record is thick enough to synthesize.

## Compounding Outputs

| Command | When | Output |
| :--- | :--- | :--- |
| `/lode:query` | Any time | Cited answer to a targeted decision-history question |
| `/lode:recall` | Session start, after history exists | Compact Decision Context |
| `/lode:roadmap` | After multiple decisions | Narrative decision roadmap with accumulating risks |
| `/lode:daily` | Daily | Obsidian daily note from raw entries + git history |
| `/lode:weekly` | Weekly | Weekly outline with conditional hard-stuff section |
| `/lode:monthly` | Monthly | Monthly review + candidate rules from repeated evidence |

Use `/lode:query` when the next agent needs to know why a choice was made. It
answers from local evidence and should return no answer when the vault has no
supporting record.

## Configuration

Lode reads config from (in priority order):

1. `{project}/.lode/config.yaml` — project-level
2. `~/.lode/config.yaml` — global
3. `$WEEKLY_PPT_PATH` — legacy environment fallback
4. `~/.weekly-ppt/` — legacy default fallback

```yaml
knowledge_vault: /path/to/your/knowledge-vault
project_slug: my-project

profile:
  project_name: My Project
  report_language: mixed
  weekly_mode: tech
  team_context: solo
```

See the [config template](https://github.com/KKenny0/Lode/blob/main/references/lode-config-template.yaml) for all options.

## Zero-Config

Skip the vault entirely. `capture` outputs structured Markdown right in the conversation, so the first session still has immediate value. Configure a vault before expecting `/lode:recall`, `/lode:query`, or reports to reuse that record across sessions.

Configure a vault later when you want compounding reports.
