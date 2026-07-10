# Workflow

## Primary Loop

```text
install -> configure vault and project group -> Daily -> Weekly -> Monthly
                                              \-> capture key sessions
```

1. Install `tracework@tracework`.
2. Run `/tracework:cold-start-interview` once per project to set its reporting
   group.
3. Use `/tracework:daily`, `/tracework:weekly`, and `/tracework:monthly` for
   high-frequency management closure.
4. End key sessions with `收工` or `/tracework:capture` so reports can explain
   intent, risks, trade-offs, and evidence boundaries.
5. Use Query, Recall, or Roadmap only when work is questioned, resumed, or
   reviewed over a long horizon.

## Scope Partition

```text
work     -> work projects only
personal -> personal projects only
all      -> separate group narratives in one private view
```

Partition happens before headline selection. Each group normally gets three
headline arcs and a portfolio containing every other meaningful stream.

## Reuse Map

```text
Capture -> raw/weeks/{week}/{slug}.json
Daily   <- raw entries + limited git fallback
Weekly  <- raw entries + limited git fallback
Monthly <- raw entries + Daily/Weekly editorial context
Query   <- derived decisions + raw entries
Recall  <- raw entries + artifact/decision navigation
Roadmap <- decision evidence pack
```

Raw entries remain semantic truth. Report-local evidence ids belong to the
appendix, not the raw schema or spoken narrative.
