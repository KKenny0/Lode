# Capture Operations

Use this reference for capture mechanics that are secondary to signal extraction.

## Auto-Capture

When configured, `/tracework:capture` can run automatically at session end via a
Claude Code `Stop` hook.

Enable it by setting `auto_capture.enabled: true` in
`~/.tracework/config.yaml`. `/tracework:cold-start-interview` sets this by
default for new configurations.

Add this to `~/.claude/settings.json` under `hooks.Stop`:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/tracework:capture"
          }
        ]
      }
    ]
  }
}
```

Disable it by setting `auto_capture.enabled: false` in
`~/.tracework/config.yaml`. Remove the hook entry from
`~/.claude/settings.json` to fully deactivate it.

The hook runs best-effort. If the vault is not configured or the helper is
unavailable, fall back to Markdown output in the conversation.

## Output Policy

Use quiet output by default whenever a vault write succeeds. This applies to
manual `/tracework:capture`, checkpoint capture, and auto-capture. Return only a
short confirmation plus the receipt:

```text
已记录 {N} 条进展 -> {slug} ({week})
depth={lite|standard|deep}: {one short routing reason}
```

If the user requested verbose output, also include the Markdown recap after the
write confirmation.

Zero-config mode is always verbose because the conversation output is the only
deliverable. Helper failures must not be silent: report the specific failure
briefly, then provide the Markdown fallback recap.

## Helper Resilience

The `tracework_raw.py` helper is the canonical write path, but capture must not
fail when the helper is unreachable:

1. Helper timeout: if `python tracework_raw.py resolve-config` takes more than
   10 seconds, briefly report the timeout and fall back to Markdown output.
2. Helper missing: if the script file is not found, briefly report the missing
   helper and fall back to Markdown output.
3. Parse errors: if the helper returns non-JSON, fall back to Markdown output
   and report the error to the user.
4. Write errors: if `append-entry` fails with a disk or permission error, fall
   back to Markdown output and report the specific error.

In all fallback cases, the Markdown output is the primary deliverable. The vault
write is a side effect that must not block the recap.

Resolve `{vault}` using the standard priority order:

| Priority | Location | Scope |
|---|---|---|
| 1 | `.tracework/config.yaml` | Project-level override |
| 2 | `~/.tracework/config.yaml` | Global default |

Use the bundled helper when available. Each helper call requires the JSON to be
on disk as a file; the scripts read `--entry` and `--artifact` paths, not stdin.

## Raw Entry Write Path

Resolve config first:

```bash
python <this-skill>/scripts/tracework_raw.py resolve-config --cwd "$PWD"
```

Then use the Write tool, not bash heredoc, pipe, redirect, or `cat > file`, to
write the entry JSON array to `{project}/.tracework/tmp-entry.json`. The Write
tool guarantees the file content is flushed to disk before the helper reads it.

Append the entry:

```bash
python <this-skill>/scripts/tracework_raw.py append-entry \
  --entry .tracework/tmp-entry.json \
  --cwd "$PWD"
```

The helper resolves config, calculates the ISO week, resolves the project slug,
validates required fields, logs adaptive-depth warnings, and appends the entry
object or array.

Delete `.tracework/tmp-entry.json` only after append succeeds. If the helper
fails, keep the temp file for debugging and fall back to Markdown output.

## Artifact Dossier Write Path

For each durable artifact dossier entry, follow the same Write -> call -> cleanup
pattern:

1. Use the Write tool to write the artifact JSON to
   `{project}/.tracework/tmp-artifact.json`.
2. Call the helper:

   ```bash
   python <this-skill>/scripts/tracework_raw.py upsert-artifact \
     --artifact .tracework/tmp-artifact.json \
     --cwd "$PWD"
   ```

3. On success, delete `.tracework/tmp-artifact.json`.

If any helper call fails, fall back to Markdown output instead of blocking the
recap.

Artifact dossier JSON stays in the existing `{vault}/raw/artifacts/{slug}.json`
path. Include dossier fields when known (`source_entry_refs`,
`artifact_summary`, `last_seen`, `source_availability`, and
`deletion_behavior`), but do not copy the full artifact text into the JSON.

## Auto-Registration

After successfully appending entries, ensure the project is registered in the
knowledge vault:

```bash
python <this-skill>/scripts/tracework_raw.py register-project --cwd "$PWD"
```

This is a best-effort side effect that keeps `{vault}/raw/projects.json` current
for weekly and daily multi-project discovery. If the helper is unavailable or
the call fails, do not block the recap.

## Confirmation

Vault mode:

```text
已记录 {N} 条进展 -> {slug} ({week})
depth={lite|standard|deep}: {one short routing reason}
```

Use the fuller confirmation only when the user requested verbose output or when
debugging a write issue:

```text
记录了 {N} 条变更 -> {slug} ({week})
  写入: {vault}/raw/weeks/{week}/{slug}.json
  - [{archetype}/{type}] {summary}
```

Zero-config mode needs no extra confirmation because the Markdown recap is the
deliverable.

## Capture Receipt

After the vault-mode confirmation, append a 2-3 line receipt that gives the user
immediate signal from what was just captured. Zero-config mode does not need a
receipt because the full Markdown output already serves this purpose.

Receipt template:

```text
📋 {最关键的 summary}
   depth={lite|standard|deep}: {one short routing reason}
   ⚠️ {N} 个风险 · ❓ {N} 个开放问题 · 🔄 {N} 个放弃方案
```

Selection rules for the top summary:

1. If any entry has `archetype: decision`, use its `summary`.
2. Otherwise, if any entry has an `impact` field, use that entry's `summary`.
3. Otherwise, use the first entry's `summary`.
4. If there is only one entry, use its `summary` directly.

Signal counts:

- Risks: count entries with `status: "risk"` plus entries whose
  `open_questions` contain risk-related phrasing.
- Open questions: count all `open_questions` items across entries.
- Abandoned alternatives: count all `abandoned_alternatives` items across
  entries.
- Capture depth: use the highest `capture_depth` across the written entries.
  The routing reason should be factual, for example "routine report atom",
  "captured outcome and evidence boundary", or "preserved decision trade-off and
  artifact context".

Omission rules:

- When a count is 0, omit that segment rather than showing "0 个".
- When all entries are `archetype: "maintenance"`, omit the prefix and use plain
  wording.

Checkpoint receipt is shorter. Show only the top summary and open questions, if
any. Skip the full signal-count line.
