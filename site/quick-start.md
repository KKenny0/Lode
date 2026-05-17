# Quick Start

## Install

```bash
# Codex Git-backed marketplace
codex plugin marketplace add KKenny0/Lode

# Or local development
codex plugin marketplace add ./path/to/Lode

# Verify installation
npx @lode/cli doctor
```

## First Run

Run the cold-start interview once to configure Lode:

```
/lode:cold-start-interview
```

This creates `~/.lode/config.yaml` with your vault path, project identity, language, and report preferences.

## Daily Use

**Start a session:**

```
开工
```

or

```
/lode:recall
```

Lode surfaces recent decisions, risks, open questions, and relevant docs from your vault.

**End a session:**

```
收工
```

or

```
/lode:capture
```

Lode classifies the session archetype and captures what matters — decisions, risks, abandoned paths, artifact changes.

## Periodic Reviews

| Command | When | Output |
| :--- | :--- | :--- |
| `/lode:query` | Any time | Cited answer to a targeted decision-history question |
| `/lode:roadmap` | Any time | Narrative decision roadmap with accumulating risks |
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

Skip the vault entirely. `capture` outputs structured Markdown right in the conversation. `recall` works from conversation context alone. You get immediate value from the first session.

Configure a vault later when you want compounding reports.
