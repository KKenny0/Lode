# Decision Replay Proof

This example dogfoods Lode on Lode itself, then keeps the public proof
reproducible through fixtures. It shows the product loop behind the claim: a
fresh coding agent can ask why the project chose a direction and receive a
compact evidence pack grounded in raw session memory.

## Source

The dogfood run used Lode's own knowledge vault. During dogfood, Lode captured
this real raw entry:

- Week: `2026-W20`
- Source file: `{vault}/raw/weeks/2026-W20/lode.json`
- Entry summary: `Prioritized a derived Decision Replay Index over autonomous capture as Lode's next product proof`
- Confidence: `explicit`

The source entry records the decision to build a derived Decision Replay Index
before a larger autonomous capture platform. It also records rejected
alternatives: building `lode-studio`/sentinel/Pi capture first, letting capture
write graph nodes directly, and adding `/lode:query` before the helper query
shape stabilized. The reproducible fixture later made `/lode:query` small enough
to add as a thin wrapper.

The committed repository proof stays reproducible through:

- `examples/vault/raw/decisions/storyboard-pipeline.json`
- `benchmarks/regression-fixtures.json`
- this dogfood note with sanitized `{vault}` paths

## Build The Index

```bash
python3 skills/roadmap/scripts/decision_graph.py build \
  --cwd "$PWD" \
  --slug lode
```

Observed dogfood result:

```json
{
  "path": "{vault}/raw/decisions/lode.json",
  "project_slug": "lode",
  "entries_read": 10,
  "nodes": 10,
  "edges": 1
}
```

The index is a derived artifact. Raw entries remain the source of truth and the
index can be rebuilt from `{vault}/raw/weeks/` at any time.

## Query 1: Why Decision Replay Before Autonomous Capture?

```bash
python3 skills/query/scripts/decision_graph.py query \
  "why decision replay index autonomous capture" \
  --cwd "$PWD" \
  --slug lode \
  --mode why \
  --limit 4
```

Top result:

```json
{
  "id": "lode:2026-W20:010",
  "confidence": "explicit",
  "decision": "Prioritized a derived Decision Replay Index over autonomous capture as Lode's next product proof",
  "why": "Lode felt thin because its capture schema already preserved motivation, alternatives, risks, and open questions, but the product experience still behaved like document generation rather than a decision replay engine any coding agent could query.",
  "source_entry_refs": [
    {
      "week": "2026-W20",
      "path": "{vault}/raw/weeks/2026-W20/lode.json",
      "timestamp": "2026-05-17T09:35:00+08:00",
      "entry_index": 0
    }
  ]
}
```

Rejected alternatives preserved in the query pack:

- Build `lode-studio`, sentinel, or Pi capture agent first: rejected because the bottleneck is replay quality, not passive collection or visualization.
- Make capture write graph nodes directly: rejected because raw entries should remain the source of truth and derived indexes should be rebuildable.
- Add a new `/lode:query` skill immediately: rejected at the time until the helper query shape stabilized through dogfood.

## Query 2: Why Keep Raw Entries As Source Of Truth?

```bash
python3 skills/query/scripts/decision_graph.py query \
  "why raw entries source of truth" \
  --cwd "$PWD" \
  --slug lode \
  --mode why \
  --limit 4
```

Top result again points to `lode:2026-W20:010`, specifically the rejected
alternative:

```json
{
  "option": "Make capture write decision graph nodes directly",
  "reason": "rejected because raw entries should remain the source of truth and derived indexes should be rebuildable"
}
```

This is the desired behavior: the helper does not need an LLM to answer the
question. It narrows the evidence so the host coding agent can synthesize an
answer with citations.

## Query 3: What Should Be Revisited Later?

```bash
python3 skills/query/scripts/decision_graph.py query \
  "zero config decision recording schema open questions" \
  --cwd "$PWD" \
  --slug lode \
  --mode revisit \
  --limit 4
```

This targeted revisit query finds the zero-config decision-recording node and
returns its open questions:

- whether zero-config Markdown output consistently follows the template across
  different agents and sessions
- whether other skills should eventually gain lightweight zero-config modes

For the W20 product-direction node, useful revisit candidates are:

- `lode-studio` / sentinel / Pi capture agent, after replay quality is proven.
- richer `/lode:query` synthesis, after helper query modes see more real usage.
- richer query scoring, if lexical matching becomes too noisy on larger vaults.

## Negative Query: Do Not Answer Missing History

```bash
python3 skills/query/scripts/decision_graph.py query \
  "why did we choose sqlite indexing for mobile sync" \
  --cwd "$PWD" \
  --slug lode \
  --mode why \
  --limit 5
```

Observed result:

```json
{
  "answerable": false,
  "terms": ["sqlite", "indexing", "mobile", "sync"],
  "top_nodes": [],
  "missing_evidence": ["No decision index nodes matched the query terms."]
}
```

This negative case matters as much as the positive ones. Decision replay is only
useful if it refuses to invent unsupported project history.

## Quality Notes

What worked:

- The top result was the intended decision node for all target queries.
- The pack preserved raw source references, confidence, rejected alternatives,
  open questions, and artifact navigation.
- An unrelated SQLite/mobile-sync query correctly returned `answerable=false`.
- The design stayed dependency-light: deterministic retrieval plus host-agent
  synthesis, no new LLM or database.

What needs more dogfood:

- Lower-ranked results can be noisy because v1 retrieval is lexical.
- Thread grouping is still simple and should improve after more real decision
  data accumulates.
- `/lode:query` should stay a thin wrapper until the helper's query modes prove
  they need richer synthesis.

## Product Conclusion

This proof moves Lode from "generate a decision roadmap document" toward
"return a cited evidence pack for why the project chose a path." That is the
core product behavior a fresh coding agent needs: recover the reasoning before
it edits the code.
