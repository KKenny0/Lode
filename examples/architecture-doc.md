# Lode Architecture Doc Excerpt - Storyboard Pipeline

This synthetic excerpt shows the level of specificity expected from `lode-arch-doc`.

## Stage: Validation

### Role in Pipeline

```text
parse -> dialogue -> panel-layout -> validation -> export
                                      |
                                      v
                                repair loop
```

The validation stage runs after panel layout generation and before export. It checks whether each storyboard panel has the fields required by the exporter and whether panel continuity constraints hold across adjacent panels.

### Contract Boundary

- Deterministic schema checks own required field presence, enum validity, and exporter compatibility.
- LLM-assisted repair owns continuity wording and recoverable panel relationship issues.
- Export remains a consumer only; it does not perform hidden repair.

## Pipeline Decision: Retry Boundaries

Panel layout generation and dialogue generation remain separate stages. Merging them would reduce orchestration steps, but it would also force dialogue regeneration for layout-only failures. The chosen design keeps retries narrower and preserves clearer weekly-report evidence when validation failures are fixed.
