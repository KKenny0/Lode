import assert from 'node:assert/strict';

export function validateReportContract(fixture) {
  const config = fixture.fixture || {};
  const output = config.candidate_output || {};
  const groups = Array.isArray(output.groups) ? output.groups : [];
  assert(groups.length > 0, `${fixture.id}: no reporting groups`);

  const seenGroups = new Set();
  for (const group of groups) {
    assert(typeof group.name === 'string' && group.name, `${fixture.id}: missing group name`);
    assert(!seenGroups.has(group.name), `${fixture.id}: duplicate group ${group.name}`);
    seenGroups.add(group.name);
    assert(typeof group.judgment === 'string' && group.judgment.trim(), `${fixture.id}: missing group judgment`);

    const headlines = Array.isArray(group.headlines) ? group.headlines : [];
    assert(headlines.length >= 1 && headlines.length <= 4, `${fixture.id}: headline count must be 1-4 per group`);
    const portfolio = Array.isArray(group.portfolio) ? group.portfolio : [];
    const covered = new Set([...headlines, ...portfolio]);
    for (const stream of group.all_streams || []) {
      assert(covered.has(stream), `${fixture.id}: uncovered stream ${stream}`);
    }

    const targets = Array.isArray(group.next_closure_targets) ? group.next_closure_targets : [];
    assert(targets.length >= 1 && targets.length <= 4, `${fixture.id}: closure target count must be 1-4 per group`);
  }

  if (output.scope === 'work') {
    assert.deepEqual([...seenGroups], ['work'], `${fixture.id}: work scope must contain only work group`);
    const serialized = JSON.stringify(output).toLowerCase();
    for (const forbidden of config.forbidden_terms || []) {
      assert(!serialized.includes(String(forbidden).toLowerCase()), `${fixture.id}: work output leaked ${forbidden}`);
    }
  }

  if (output.scope === 'all') {
    assert(groups.length >= 2, `${fixture.id}: all scope must preserve separate groups`);
  }
}
