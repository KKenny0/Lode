# Release Artifact Inventory

This inventory records ignored local artifacts that can affect release confidence.
It is a cleanup guide, not a deletion script. User-authored notes and historical
workspaces need explicit review before removal.

## Generated Or Cache Artifacts

| Path | Role | Release decision | Cleanup policy |
| :--- | :--- | :--- | :--- |
| `cli/dist/` | TypeScript build output for the installer CLI. | Keep ignored; regenerate with `npm --prefix cli run build`. | Safe to delete after verification. |
| `cli/skills/` | Generated skill copy used by CLI packaging checks. | Keep ignored; regenerate with `npm --prefix cli run copy-skills` or `check-skills`. | Safe to delete after verification. |
| `site/.vitepress/cache/` | VitePress cache. | Keep ignored. | Safe to delete after verification. |
| `site/.vitepress/dist/` | VitePress static site build output. | Keep ignored; deployment should rebuild it. | Safe to delete after verification. |
| `skills/**/__pycache__/` | Python bytecode caches from helper execution. | Keep ignored. | Safe to delete after verification. |
| `cli/node_modules/`, `site/node_modules/` | Installed package dependencies. | Keep ignored. | Safe to delete only when reinstall cost is acceptable. |

## Local Planning And User-Owned Notes

| Path | Role | Release decision | Cleanup policy |
| :--- | :--- | :--- | :--- |
| `DESIGN.md` | Local design notes outside the public docs set. | Keep ignored unless promoted into tracked docs. | Requires user review before deletion. |
| `ROADMAP.md` | Local planning notes. | Keep ignored unless promoted into tracked roadmap docs. | Requires user review before deletion. |
| `TODO*.md` | Local task scratchpads. | Keep ignored. | Requires user review before deletion. |
| `docs/2026-*` | Local dated working notes under the ignored docs namespace. | Keep ignored unless a note becomes public release documentation. | Requires user review before deletion. |
| `.gstack/` | Local GStack browser/audit logs. | Keep ignored; not part of Lode packaging. | Safe to delete when no active audit run depends on it. |

## Legacy Or Stale Candidates

| Path | Role | Release decision | Cleanup policy |
| :--- | :--- | :--- | :--- |
| `skills/lode-*` | Legacy installed or generated skill directories that predate the current `skills/{capture,recall,...}` layout. | Do not package unless explicitly reintroduced; current plugin manifests should use canonical skill directories. | Inspect and ask before deletion. |
| `*-workspace/` | Local benchmark or evaluation workspaces. | Keep ignored; public protocols live in `benchmarks/`. | Requires user review before deletion. |
| `skills/*/evals/` | Private eval fixtures and transcripts. | Keep ignored; do not publish private fixtures. | Requires user review before deletion. |

## Release Check

Before release, the tracked tree should remain clean after generated outputs are
removed. The expected verification loop is:

```bash
node examples/decision-replay-demo.mjs
npm --prefix cli run test:regression
npm --prefix cli run build
npm --prefix cli run check-skills
npm --prefix cli run test:doctor
npm --prefix site run build
```

Then remove generated outputs listed above and confirm `git status --short`
shows only intentional tracked changes.
