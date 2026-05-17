# Recall Output Template

```markdown
## Session Start Recall — {project}

### Recent Progress
- {timestamp}: {summary}

### Relevant Decisions
- {timestamp}: {decision and why it matters now}

### Decision Context
- {decision_id}: {decision} — why: {why}; evidence: {source_entry_refs timestamp}; confidence: {confidence}

### Abandoned Alternatives
- {timestamp}: {alternative} — {reason it was rejected}

### Open Questions
- {timestamp}: {question}

### Risks To Check
- {timestamp}: {risk}

### Docs Worth Reading
- {artifact_id}: {title} — {path or repo_relative_path}

### Potentially Stale Intent Artifacts
- {timestamp}: {reason} — {summary}

### Suggested Entry Point
{one short recommendation grounded in the recalled evidence}
```

Keep the output compact. Prefer a thin recall with real evidence over a rich
recall built from assumptions.
