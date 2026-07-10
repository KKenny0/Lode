# Quick Start

## 1. Install

```bash
codex plugin marketplace add KKenny0/Tracework
codex plugin add tracework@tracework
```

## 2. Configure Once Per Project

Run `/tracework:cold-start-interview`. Choose the local vault, project identity,
and reporting group such as `work` or `personal`.

After upgrading from 0.2, run it once in each existing project. Unassigned
projects are excluded from scoped reports rather than guessed into work output.

## 3. Close the Work

```text
/tracework:daily work
/tracework:weekly work
/tracework:monthly work
```

Use `personal` for personal projects or `all` for a private combined view with
separate group sections. Weekly returns a Markdown brief by default; say
`weekly PPT` when you need a slide outline.

Without raw entries, reports can use meaningful git activity as `limited`
coverage. They do not invent intent, decisions, or verified impact.

## 4. Improve the Evidence

End key work with `收工` or `/tracework:capture`. Capture chooses lite,
standard, or deep from the session signal and stores only durable facts.

## 5. Use Trust and Recovery When Needed

- `/tracework:query why did we choose ...?`
- `/tracework:recall` when resuming older work
- `/tracework:roadmap` for a long-range decision review

These are lower-frequency surfaces; they do not need to become daily habits.
