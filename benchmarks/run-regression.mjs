#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const fixturesPath = path.join(scriptDir, 'regression-fixtures.json');
const decisionGraph = path.join(repoRoot, 'skills', 'query', 'scripts', 'decision_graph.py');
const recallContext = path.join(repoRoot, 'skills', 'recall', 'scripts', 'recall_context.py');

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

function assertNoSymlinks(root, sourceLabel) {
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) {
      throw new Error(`fixture vault must not contain symlinks: ${sourceLabel}`);
    }
    if (!stat.isDirectory()) continue;
    for (const entry of fs.readdirSync(current)) {
      stack.push(path.join(current, entry));
    }
  }
}

function copyFixtureVault(config) {
  const sourceVault = path.resolve(repoRoot, config.vault);
  const realSourceVault = fs.realpathSync(sourceVault);
  const allowedRoots = [
    fs.realpathSync(path.join(repoRoot, 'examples')),
    fs.realpathSync(path.join(repoRoot, 'benchmarks')),
  ];
  if (!allowedRoots.some(root => realSourceVault === root || realSourceVault.startsWith(`${root}${path.sep}`))) {
    throw new Error(`fixture vault must be under examples/ or benchmarks/: ${config.vault}`);
  }
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lode-regression-'));
  const tempVault = path.join(tempRoot, 'vault');
  fs.cpSync(realSourceVault, tempVault, { recursive: true, dereference: false });
  assertNoSymlinks(tempVault, config.vault);
  return { tempRoot, tempVault };
}

function assertQueryMetadata(queryPack, fixture) {
  assert(Array.isArray(queryPack.matched_terms), `${fixture.id}: missing matched_terms`);
  assert(
    typeof queryPack.evidence_strength === 'string' && queryPack.evidence_strength,
    `${fixture.id}: missing evidence_strength`,
  );
  assert(
    typeof queryPack.answerability_reason === 'string' && queryPack.answerability_reason,
    `${fixture.id}: missing answerability_reason`,
  );
}

function assertMatchedTerms(queryPack, expectedTerms, fixtureId) {
  if (!Array.isArray(expectedTerms) || expectedTerms.length === 0) return;
  const matched = new Set((queryPack.matched_terms || []).map(term => String(term).toLowerCase()));
  for (const term of expectedTerms) {
    assert(matched.has(String(term).toLowerCase()), `${fixtureId}: matched_terms missing ${term}`);
  }
}

function buildDecisionIndex(tempVault, slug) {
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
  const index = readJson(buildResult.path);
  return { buildResult, index };
}

function queryDecisionIndex(tempVault, slug, query, mode = 'why') {
  return runJson('python3', [
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
}

function assertBuiltIndex(index, slug, fixtureId) {
  assert(index.schema_version === 'lode.decision_replay.v1', `${fixtureId}: bad index schema`);
  assert(index.project_slug === slug, `${fixtureId}: bad project slug`);
  assert(Array.isArray(index.nodes), `${fixtureId}: index nodes must be an array`);
  assert(Array.isArray(index.edges), `${fixtureId}: index edges must be an array`);
  assertSourceRefs(index.nodes, fixtureId);
}

function runQueryPositiveFixture(fixture) {
  const config = fixture.fixture || {};
  const slug = config.project_slug;
  const query = config.query;
  const mode = config.mode || 'why';
  const { tempRoot, tempVault } = copyFixtureVault(config);

  try {
    const { index } = buildDecisionIndex(tempVault, slug);
    assertBuiltIndex(index, slug, fixture.id);

    const queryPack = queryDecisionIndex(tempVault, slug, query, mode);
    assert(queryPack.schema_version === 'lode.decision_query.v1', `${fixture.id}: bad query schema`);
    assert(queryPack.answerable === true, `${fixture.id}: expected query to be answerable`);
    assertQueryMetadata(queryPack, fixture);
    assertMatchedTerms(queryPack, config.expected_matched_terms, fixture.id);
    assert(Array.isArray(queryPack.top_nodes) && queryPack.top_nodes.length > 0, `${fixture.id}: missing top nodes`);
    const topNode = queryPack.top_nodes[0] || {};
    assert(
      topNode.id === config.expected_top_node,
      `${fixture.id}: expected validation repair node first, got ${topNode.id}`,
    );
    assert(topNode.confidence === 'explicit', `${fixture.id}: expected explicit top node`);
    assertSourceRefs(queryPack.top_nodes, fixture.id);
    assert(
      queryPack.rejected_alternatives.some(item => (
        String(item.option || '').includes(config.expected_rejected_option)
        && String(item.reason || '').includes(config.expected_rejected_reason)
      )),
      `${fixture.id}: missing rejected orchestration alternative`,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function runQueryNegativeFixture(fixture) {
  const config = fixture.fixture || {};
  const slug = config.project_slug;
  const query = config.query;
  const mode = config.mode || 'why';
  const { tempRoot, tempVault } = copyFixtureVault(config);

  try {
    buildDecisionIndex(tempVault, slug);
    const negativePack = queryDecisionIndex(tempVault, slug, query, mode);
    assert(negativePack.answerable === false, `${fixture.id}: negative query should not be answerable`);
    assertQueryMetadata(negativePack, fixture);
    assert(
      Array.isArray(negativePack.missing_evidence) && negativePack.missing_evidence.length > 0,
      `${fixture.id}: negative query should include missing_evidence`,
    );
    const absentTerms = new Set((config.expected_matched_terms_absent || []).map(term => String(term).toLowerCase()));
    const matched = (negativePack.matched_terms || []).map(term => String(term).toLowerCase());
    assert(
      matched.every(term => !absentTerms.has(term)),
      `${fixture.id}: unrelated query terms should not be treated as matched evidence`,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function runQueryIndexFallbackFixture(fixture) {
  const config = fixture.fixture || {};
  const slug = config.project_slug;
  const query = config.query;
  const mode = config.mode || 'why';
  const { tempRoot, tempVault } = copyFixtureVault(config);
  const decisionPath = path.join(tempVault, 'raw', 'decisions', `${slug}.json`);

  try {
    fs.mkdirSync(path.dirname(decisionPath), { recursive: true });
    fs.writeFileSync(decisionPath, '{not json', 'utf-8');
    const invalidJsonPack = queryDecisionIndex(tempVault, slug, query, mode);
    assert(
      invalidJsonPack.top_nodes?.[0]?.id === config.expected_top_node,
      `${fixture.id}: invalid JSON fallback returned ${invalidJsonPack.top_nodes?.[0]?.id}`,
    );

    fs.writeFileSync(decisionPath, JSON.stringify({
      schema_version: 'lode.decision_replay.v1',
      project_slug: slug,
      generated_at: '2000-01-01T00:00:00+00:00',
      source: {
        kind: 'test-stale-index',
        raw_entry_count: 0,
        node_count: 0,
      },
      nodes: [],
      edges: [],
    }, null, 2), 'utf-8');
    const stalePack = queryDecisionIndex(tempVault, slug, query, mode);
    assert(
      stalePack.top_nodes?.[0]?.id === config.expected_top_node,
      `${fixture.id}: stale index fallback returned ${stalePack.top_nodes?.[0]?.id}`,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function runRecallRebuildFixture(fixture) {
  const config = fixture.fixture || {};
  const slug = config.project_slug;
  const limit = String(config.limit || 5);
  const { tempRoot, tempVault } = copyFixtureVault(config);
  const decisionPath = path.join(tempVault, 'raw', 'decisions', `${slug}.json`);

  try {
    fs.rmSync(decisionPath, { force: true });
    const rebuiltContext = runJson('python3', [
      recallContext,
      '--vault',
      tempVault,
      '--slug',
      slug,
      '--cwd',
      repoRoot,
      '--limit',
      limit,
    ]);

    assert(Array.isArray(rebuiltContext.decision_context), `${fixture.id}: missing decision_context`);
    assert(
      rebuiltContext.decision_context.some(item => item.id === config.expected_decision_id),
      `${fixture.id}: rebuilt decision_context missing ${config.expected_decision_id}`,
    );
    assert(fs.existsSync(decisionPath), `${fixture.id}: expected rebuilt decision index at ${decisionPath}`);
    assert(
      rebuiltContext.decision_context_source && typeof rebuiltContext.decision_context_source === 'object',
      `${fixture.id}: missing decision_context_source`,
    );
    assert(
      String(rebuiltContext.decision_context_source.path || '').endsWith(`/raw/decisions/${slug}.json`),
      `${fixture.id}: decision_context_source.path should point at the derived decision index`,
    );
    assert(rebuiltContext.decision_context_source.rebuilt === true, `${fixture.id}: expected rebuilt=true`);
    assert(
      typeof rebuiltContext.decision_context_source.reason === 'string'
        && rebuiltContext.decision_context_source.reason,
      `${fixture.id}: missing rebuild reason`,
    );

    const freshContext = runJson('python3', [
      recallContext,
      '--vault',
      tempVault,
      '--slug',
      slug,
      '--cwd',
      repoRoot,
      '--limit',
      limit,
    ]);
    assert(
      freshContext.decision_context_source && typeof freshContext.decision_context_source === 'object',
      `${fixture.id}: fresh run missing decision_context_source`,
    );
    assert(freshContext.decision_context_source.rebuilt === false, `${fixture.id}: expected rebuilt=false on fresh run`);
    assert(
      Array.isArray(freshContext.decision_context)
        && freshContext.decision_context.some(item => item.id === config.expected_decision_id),
      `${fixture.id}: fresh decision_context missing ${config.expected_decision_id}`,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function runUnsafeSlugFixture(fixture) {
  const config = fixture.fixture || {};
  const { tempRoot, tempVault } = copyFixtureVault(config);
  const unsafeSlug = config.unsafe_slug || '../outside';
  const escapedPath = path.resolve(tempVault, 'raw', 'outside.json');

  try {
    const buildResult = spawnSync('python3', [
      decisionGraph,
      'build',
      '--vault',
      tempVault,
      '--slug',
      unsafeSlug,
      '--cwd',
      repoRoot,
    ], {
      cwd: repoRoot,
      encoding: 'utf-8',
    });
    assert(buildResult.status !== 0, `${fixture.id}: decision graph build should reject unsafe slug`);
    assert(
      `${buildResult.stderr}\n${buildResult.stdout}`.includes('project slug must be a filename-safe value'),
      `${fixture.id}: decision graph build should explain unsafe slug rejection`,
    );

    const queryResult = spawnSync('python3', [
      decisionGraph,
      'query',
      'why validation repair ownership',
      '--vault',
      tempVault,
      '--slug',
      unsafeSlug,
      '--cwd',
      repoRoot,
    ], {
      cwd: repoRoot,
      encoding: 'utf-8',
    });
    assert(queryResult.status !== 0, `${fixture.id}: decision graph query should reject unsafe slug`);

    const recallResult = spawnSync('python3', [
      recallContext,
      '--vault',
      tempVault,
      '--slug',
      unsafeSlug,
      '--cwd',
      repoRoot,
    ], {
      cwd: repoRoot,
      encoding: 'utf-8',
    });
    assert(recallResult.status !== 0, `${fixture.id}: recall should reject unsafe slug`);
    assert(!fs.existsSync(escapedPath), `${fixture.id}: unsafe slug created escaped path ${escapedPath}`);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function runExecutableFixture(fixture) {
  const kind = fixture.execution?.kind || 'documented-only';
  if (kind === 'query-positive') {
    runQueryPositiveFixture(fixture);
  } else if (kind === 'query-negative') {
    runQueryNegativeFixture(fixture);
  } else if (kind === 'query-index-fallback') {
    runQueryIndexFallbackFixture(fixture);
  } else if (kind === 'recall-rebuild') {
    runRecallRebuildFixture(fixture);
  } else if (kind === 'unsafe-slug') {
    runUnsafeSlugFixture(fixture);
  } else if (kind === 'documented-only') {
    skipped.push(fixture.id);
  } else {
    throw new Error(`unknown executable fixture kind: ${kind}`);
  }
}

function main() {
  const data = readJson(fixturesPath);
  const fixtures = Array.isArray(data.fixtures) ? data.fixtures : [];
  for (const fixture of fixtures) {
    try {
      runExecutableFixture(fixture);
    } catch (error) {
      fail(`${fixture.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length > 0) {
    console.error('Regression checks failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    if (skipped.length > 0) {
      console.error(`Documented-only fixtures: ${skipped.join(', ')}`);
    }
    process.exit(1);
  }

  console.log(`Regression checks passed (${fixtures.length - skipped.length} executable, ${skipped.length} documented).`);
  if (skipped.length > 0) {
    console.log(`Documented-only fixtures: ${skipped.join(', ')}`);
  }
}

main();
