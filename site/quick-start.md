# Quick Start

## 1. Install

```bash
codex plugin marketplace add KKenny0/Tracework
codex plugin add tracework@tracework
```

Update:

```bash
codex plugin marketplace upgrade tracework
codex plugin add tracework@tracework
```

## 2. Configure the Vault

Run once:

```text
/tracework:cold-start-interview
```

This writes config under `~/.tracework/config.yaml` or
`{project}/.tracework/config.yaml`.

## 3. Generate Useful Output

You can start with the output you need:

```text
/tracework:daily
/tracework:weekly
/tracework:query why did we choose <the decision>?
```

If raw entries are missing, daily and weekly use git as limited fallback
coverage. They should not invent motivation, trade-offs, or verified impact.

## 4. Capture Key Sessions

At the end of important work, say:

```text
收工
```

or run:

```text
/tracework:capture
```

For long work, capture a durable checkpoint:

```text
/tracework:capture checkpoint
```

Capture routes itself to lite, standard, or deep depth from the session signal.
It should record the decisions, rejected paths, risks, evidence, artifact
changes, and next steps that git cannot explain. If no vault is configured, it
can still return a structured recap in the conversation.

## 5. Query One Decision

Ask a concrete why question:

```text
/tracework:query why did we choose <the decision>?
```

A good answer includes matched decision nodes, raw `source_entry_refs`, rejected
alternatives when recorded, and an explicit evidence gap when the record is not
strong enough.

## 6. Reuse the Record

| Command | Use after | Purpose |
| :--- | :--- | :--- |
| `/tracework:recall` | A few captured sessions | Start the next session with durable context |
| `/tracework:weekly` | Now, or after a week of records | Build a brief-ready outline |
| `/tracework:monthly` | Now, or after a month of daily reports | Generate a review and repeated-rule candidates |
| `/tracework:roadmap` | Multiple decisions | Review how decisions evolved |

## Storage

Tracework reads config from:

1. `{project}/.tracework/config.yaml`
2. `~/.tracework/config.yaml`

Configure `knowledge_vault` in one of those files. Tracework writes raw entries,
decision indexes, and readable outputs into that vault.
