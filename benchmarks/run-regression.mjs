#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const fixturesPath = path.join(scriptDir, 'regression-fixtures.json');
const decisionGraph = path.join(repoRoot, 'skills', 'roadmap', 'scripts', 'decision_graph.py');
const NEGATIVE_QUERY = 'why did we choose sqlite indexing for mobile sync';

const failures = [];
const skipped = [];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function runJson(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf-8',
    ...options,
  });
  if (result.status !== 0) {
    throw new Error([
      `${command} ${args.join(' ')} failed with status ${result.status}`,
      result.stdout.trim(),
      result.stderr.trim(),
    ].filter(Boolean).join('\n'));
  }
  return JSON.parse(result.stdout);
}

function assertSourceRefs(nodes, fixtureId) {
  assert(nodes.length > 0, `${fixtureId}: expected at least one node`);
  for (const node of nodes) {
    assert(Array.isArray(node.source_entry_refs), `${fixtureId}: node ${node.id} missing source_entry_refs`);
    assert(node.source_entry_refs.length > 0, `${fixtureId}: node ${node.id} has empty source_entry_refs`);
    for (const ref of node.source_entry_refs) {
      assert(typeof ref.week === 'string' && ref.week, `${fixtureId}: source ref missing week`);
      assert(typeof ref.path === 'string' && ref.path, `${fixtureId}: source ref missing path`);
      assert(typeof ref.timestamp === 'string' && ref.timestamp, `${fixtureId}: source ref missing timestamp`);
      assert(Number.isInteger(ref.entry_index), `${fixtureId}: source ref missing entry_index`);
    }
  }
}

function runDecisionReplayFixture(fixture) {
  const config = fixture.fixture || {};
  const sourceVault = path.resolve(repoRoot, config.vault);
  const slug = config.project_slug;
  const query = config.query;
  const mode = config.mode || 'why';
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lode-regression-'));
  const tempVault = path.join(tempRoot, 'vault');

  try {
    fs.cpSync(sourceVault, tempVault, { recursive: true });

    const buildResult = runJson('python3', [
      decisionGraph,
      'build',
      '--vault',
      tempVault,
      '--slug',
      slug,
      '--cwd',
      repoRoot,
    ]);
    const indexPath = buildResult.path;
    const index = readJson(indexPath);

    assert(index.schema_version === 'lode.decision_replay.v1', `${fixture.id}: bad index schema`);
    assert(index.project_slug === slug, `${fixture.id}: bad project slug`);
    assert(Array.isArray(index.nodes), `${fixture.id}: index nodes must be an array`);
    assert(Array.isArray(index.edges), `${fixture.id}: index edges must be an array`);
    assertSourceRefs(index.nodes, fixture.id);

    const queryPack = runJson('python3', [
      decisionGraph,
      'query',
      query,
      '--vault',
      tempVault,
      '--slug',
      slug,
      '--mode',
      mode,
      '--limit',
      '5',
    ]);
    assert(queryPack.schema_version === 'lode.decision_query.v1', `${fixture.id}: bad query schema`);
    assert(queryPack.answerable === true, `${fixture.id}: expected query to be answerable`);
    assert(Array.isArray(queryPack.top_nodes) && queryPack.top_nodes.length > 0, `${fixture.id}: missing top nodes`);
    const topNode = queryPack.top_nodes[0] || {};
    assert(
      topNode.id === 'storyboard-pipeline:2026-W19:003',
      `${fixture.id}: expected validation repair node first, got ${topNode.id}`,
    );
    assert(topNode.confidence === 'explicit', `${fixture.id}: expected explicit top node`);
    assertSourceRefs(queryPack.top_nodes, fixture.id);
    assert(
      queryPack.rejected_alternatives.some(item => (
        String(item.option || '').includes('Orchestration-level repair ownership')
        && String(item.reason || '').includes('validation internals')
      )),
      `${fixture.id}: missing rejected orchestration alternative`,
    );

    const negativePack = runJson('python3', [
      decisionGraph,
      'query',
      NEGATIVE_QUERY,
      '--vault',
      tempVault,
      '--slug',
      slug,
      '--mode',
      'why',
      '--limit',
      '5',
    ]);
    assert(negativePack.answerable === false, `${fixture.id}: negative query should not be answerable`);
    assert(
      Array.isArray(negativePack.missing_evidence) && negativePack.missing_evidence.length > 0,
      `${fixture.id}: negative query should include missing_evidence`,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function main() {
  const data = readJson(fixturesPath);
  const fixtures = Array.isArray(data.fixtures) ? data.fixtures : [];
  for (const fixture of fixtures) {
    if (fixture.id === 'decision-replay-index-query-pack') {
      try {
        runDecisionReplayFixture(fixture);
      } catch (error) {
        fail(`${fixture.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      skipped.push(fixture.id);
    }
  }

  if (failures.length > 0) {
    console.error('Regression checks failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`Regression checks passed (${fixtures.length - skipped.length} executable, ${skipped.length} documented).`);
  if (skipped.length > 0) {
    console.log(`Documented-only fixtures: ${skipped.join(', ')}`);
  }
}

main();
