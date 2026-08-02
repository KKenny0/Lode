# W31 P3-E acceptance TODO

Status: **open**. This does not block the `0.7.1` patch release, but Phase 2
remains unaccepted until the real-machine check below passes.

Run on the computer that contains the referenced storyboard repository:

- [ ] Capture a real `repository_snapshot` with an absolute repository path and
  full immutable commit object id before the Weekly `as_of` cutoff.
- [ ] Regenerate the W31 PPT Mode candidate from the real raw entry and reopen
  the referenced commit and snapshot instead of expanding the prior Weekly.
- [ ] Confirm the commit repository and snapshot repository are identical and
  `git merge-base --is-ancestor <evidence-commit> <snapshot>` succeeds.
- [ ] Verify every node and edge on the current-architecture page against the
  captured committed tree; keep uncommitted work and target design separate.
- [ ] Complete the manual P3-E semantic review and record pass/fail evidence in
  the W31 candidate. If it fails, keep P3-E open and revise the candidate.

Close this TODO only after that evidence is committed. Do not replace the real
snapshot with the current branch `HEAD` or mark the documented-only fixture as
executable without a reproducible repository fixture.
