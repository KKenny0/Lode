#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const fixturesPath = path.join(scriptDir, 'regression-fixtures.json');
const captureRaw = path.join(repoRoot, 'skills', 'capture', 'scripts', 'tracework_raw.py');
const decisionGraph = path.join(repoRoot, 'skills', 'query', 'scripts', 'decision_graph.py');
const roadmapGraph = path.join(repoRoot, 'skills', 'roadmap', 'scripts', 'decision_graph.py');
const recallContext = path.join(repoRoot, 'skills', 'recall', 'scripts', 'recall_context.py');

const STORYBOARD_PIPELINE_RAW_WEEKS = {
  '2026-W18': [
    {
      timestamp: '2026-04-28T16:20:00+08:00',
      type: 'feature',
      summary: 'Split storyboard validation into deterministic schema checks and LLM-assisted repair loops',
      context: 'Single-pass validation hid recurring panel continuity failures until export time. The split gives weekly reporting a clear reliability story and gives future debugging a stable contract boundary.',
      source: 'session-recap',
      status: 'done',
      impact: 'Weekly reporting can explain the reliability improvement without re-reading implementation commits.',
      project_area: 'validation',
      work_stream: 'Storyboard reliability',
      evidence_refs: ['abc1234', 'eval:continuity-regression-07'],
    },
    {
      timestamp: '2026-04-29T11:45:00+08:00',
      type: 'decision',
      summary: 'Kept panel layout generation separate from dialogue generation to preserve independent retry boundaries',
      context: 'Combining both stages made repair cheaper in the happy path but caused dialogue rewrites during layout-only failures. Separate contracts trade a small orchestration cost for more predictable retries.',
      source: 'session-recap',
      status: 'decision',
      impact: 'Architecture docs now preserve the retry-boundary decision for future stage changes.',
      project_area: 'pipeline orchestration',
      work_stream: 'Stage contract design',
      evidence_refs: ['doc:pipeline-evolution-v1'],
    },
  ],
  '2026-W19': [
    {
      timestamp: '2026-05-05T18:10:00+08:00',
      type: 'decision',
      summary: 'Kept validation repair loops inside the validation stage while preserving orchestration-level retry boundaries',
      context: 'Moving repair ownership upstream would make orchestration aware of validation internals. Keeping ownership local preserves stage encapsulation, while artifact index metadata gives future recall a stable document entry point.',
      source: 'session-recap',
      status: 'decision',
      impact: 'Future session-start recall can point directly to the validation-stage architecture doc instead of re-reading all weekly entries.',
      project_area: 'validation',
      work_stream: 'Stage contract design',
      evidence_refs: ['doc:validation-stage-v1'],
      motivation: 'Repair ownership was becoming ambiguous between validation and orchestration.',
      exploration_paths: [
        'Move repair ownership upstream into orchestration -> centralizes retries but leaks validation internals',
        'Keep repair ownership inside validation -> preserves encapsulation and narrower retry scope',
      ],
      abandoned_alternatives: [
        'Orchestration-level repair ownership: rejected because it would make orchestration depend on validation internals',
      ],
      open_questions: [
        'Should repair-loop latency be tracked at validation-stage level or orchestration level?',
      ],
    },
    {
      timestamp: '2026-05-06T09:30:00+08:00',
      type: 'risk',
      summary: 'Identified stale architecture docs as a recall risk when stage contracts change without re-indexing',
      context: 'Session-start recall can only be trusted if indexed docs remain tied to current contracts. Session recap should record sync suggestions after implementation changes.',
      source: 'session-recap',
      status: 'risk',
      impact: 'Decision roadmap and weekly outline can surface stale indexed docs before they mislead future sessions.',
      project_area: 'documentation',
      work_stream: 'Artifact governance',
      motivation: 'Artifact index introduces a new source navigation layer that can become stale.',
      open_questions: [
        'What signal should mark an indexed artifact as stale: file mtime, raw entry lifecycle, or explicit sync suggestion?',
      ],
      sync_suggestions: [
        'Review architecture docs and artifact metadata when stage contracts change.',
      ],
    },
  ],
  '2026-W20': [
    {
      timestamp: '2026-05-12T10:15:00+08:00',
      archetype: 'decision',
      type: 'decision',
      summary: 'Chose explicit retry budget policy for validation repair loops',
      context: 'Validation repair loops needed a durable thread separate from broader orchestration governance. The raw entry records the policy thread directly so decision replay does not infer the topic from artifact hints.',
      source: 'session-recap',
      status: 'decision',
      project_area: 'orchestration',
      work_stream: 'Artifact governance',
      decision_threads: ['retry-budget-policy'],
      lifecycle_transition: {
        subject: 'decision:retry-budget-policy',
        from: 'proposed',
        to: 'chosen',
        reason: 'Validation repair retries need an explicit budget before orchestration retries are considered.',
      },
      source_refs: [
        {
          type: 'conversation',
          ref: 'session:2026-05-12-validation-retry-budget',
          note: 'Session discussion selected the validation-local retry budget policy.',
        },
      ],
      motivation: 'Without an explicit retry budget policy, validation-stage repair could be confused with orchestration-level retry governance.',
      exploration_paths: [
        'Infer retry policy from artifact topics -> keeps raw entries shorter but lets artifact metadata dominate thread assignment',
        'Record retry-budget-policy as an explicit decision thread -> preserves the intended replay topic',
      ],
      abandoned_alternatives: [
        'Artifact-derived retry thread: rejected because artifact governance hints should not override raw-entry decision intent',
      ],
      impact: 'Decision replay can group validation retry budget decisions without relying on artifact metadata.',
      evidence_refs: ['conversation:2026-05-12-validation-retry-budget'],
      artifact_context: [
        {
          artifact_path: '/Users/example/projects/storyboard-pipeline/DESIGN.md',
          scope: 'Orchestration retry governance and artifact lifecycle review.',
          delta: 'Noted that validation repair retry budget is owned by the validation stage.',
          open_questions: [],
          source_of_truth: ['src/stages/validation.py', 'tests/test_validation_retry_budget.py'],
        },
      ],
    },
  ],
};

const FIXTURE_PRESETS = {
  'storyboard-pipeline-decision-replay': {
    project_slug: 'storyboard-pipeline',
    raw_weeks: STORYBOARD_PIPELINE_RAW_WEEKS,
  },
};

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

function writeRawWeek(tempVault, week, slug, entries) {
  if (!slug) throw new Error('raw fixture requires project_slug');
  if (!Array.isArray(entries)) throw new Error(`raw fixture week ${week} must be an array`);
  const rawPath = path.join(tempVault, 'raw', 'weeks', week, `${slug}.json`);
  fs.mkdirSync(path.dirname(rawPath), { recursive: true });
  fs.writeFileSync(rawPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf-8');
}

function copyFixtureVault(config) {
  const preset = config.fixture_preset ? FIXTURE_PRESETS[config.fixture_preset] : null;
  if (config.fixture_preset && !preset) {
    throw new Error(`unknown fixture preset: ${config.fixture_preset}`);
  }
  const effectiveConfig = preset ? { ...preset, ...config } : config;
  if (effectiveConfig.raw_weeks && typeof effectiveConfig.raw_weeks === 'object') {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tracework-regression-'));
    const tempVault = path.join(tempRoot, 'vault');
    for (const [week, entries] of Object.entries(effectiveConfig.raw_weeks)) {
      writeRawWeek(tempVault, week, effectiveConfig.project_slug, entries);
    }
    return { tempRoot, tempVault };
  }
  if (Array.isArray(effectiveConfig.raw_entries)) {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tracework-regression-'));
    const tempVault = path.join(tempRoot, 'vault');
    const week = effectiveConfig.week || '2026-W24';
    writeRawWeek(tempVault, week, effectiveConfig.project_slug, effectiveConfig.raw_entries);
    return { tempRoot, tempVault };
  }
  const sourceVault = path.resolve(repoRoot, effectiveConfig.vault);
  const realSourceVault = fs.realpathSync(sourceVault);
  const allowedRoots = [
    fs.realpathSync(path.join(repoRoot, 'benchmarks')),
  ];
  if (!allowedRoots.some(root => realSourceVault === root || realSourceVault.startsWith(`${root}${path.sep}`))) {
    throw new Error(`fixture vault must be under benchmarks/: ${effectiveConfig.vault}`);
  }
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tracework-regression-'));
  const tempVault = path.join(tempRoot, 'vault');
  fs.cpSync(realSourceVault, tempVault, { recursive: true, dereference: false });
  assertNoSymlinks(tempVault, effectiveConfig.vault);
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

function roadmapDecisionIndex(tempVault, slug, limitThreads = 10) {
  return runJson('python3', [
    roadmapGraph,
    'roadmap',
    '--vault',
    tempVault,
    '--slug',
    slug,
    '--cwd',
    repoRoot,
    '--limit-threads',
    String(limitThreads),
  ]);
}

function assertBuiltIndex(index, slug, fixtureId) {
  assert(index.schema_version === 'tracework.decision_replay.v1', `${fixtureId}: bad index schema`);
  assert(index.project_slug === slug, `${fixtureId}: bad project slug`);
  assert(index.source?.builder_version === 2, `${fixtureId}: bad decision index builder version`);
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
    assert(queryPack.schema_version === 'tracework.decision_query.v1', `${fixture.id}: bad query schema`);
    assert(queryPack.answerable === true, `${fixture.id}: expected query to be answerable`);
    assertQueryMetadata(queryPack, fixture);
    assertMatchedTerms(queryPack, config.expected_matched_terms, fixture.id);
    assert(Array.isArray(queryPack.top_nodes) && queryPack.top_nodes.length > 0, `${fixture.id}: missing top nodes`);
    const topNode = queryPack.top_nodes[0] || {};
    assert(
      topNode.id === config.expected_top_node,
      `${fixture.id}: expected top node ${config.expected_top_node}, got ${topNode.id}`,
    );
    assert(topNode.confidence === 'explicit', `${fixture.id}: expected explicit top node`);
    assertSourceRefs(queryPack.top_nodes, fixture.id);
    if (config.expected_evidence_strength) {
      assert(
        queryPack.evidence_strength === config.expected_evidence_strength,
        `${fixture.id}: expected evidence_strength ${config.expected_evidence_strength}, got ${queryPack.evidence_strength}`,
      );
    }
    if (config.expected_missing_evidence_text) {
      assert(
        queryPack.missing_evidence?.some(item => String(item).includes(config.expected_missing_evidence_text)),
        `${fixture.id}: missing_evidence should mention ${config.expected_missing_evidence_text}`,
      );
    }
    if (config.expected_evidence_ref) {
      assert(
        topNode.evidence_refs?.includes(config.expected_evidence_ref),
        `${fixture.id}: compact top node lost evidence ref ${config.expected_evidence_ref}`,
      );
    }
    if (config.expected_direct_artifact_ref) {
      assert(
        topNode.direct_artifact_refs?.includes(config.expected_direct_artifact_ref),
        `${fixture.id}: compact top node lost source-of-truth artifact ref ${config.expected_direct_artifact_ref}`,
      );
    }
    if (config.expected_supporting_decision_absent) {
      assert(
        !queryPack.supporting_nodes?.some(node => String(node.decision || '').includes(config.expected_supporting_decision_absent)),
        `${fixture.id}: unrelated supporting node leaked into the query pack`,
      );
    }
    if (config.expected_thread_id) {
      const indexedTopNode = index.nodes.find(node => node.id === config.expected_top_node) || {};
      assert(topNode.thread_id === config.expected_thread_id, `${fixture.id}: top node thread_id was ${topNode.thread_id}`);
      assert(
        indexedTopNode.thread_id === config.expected_thread_id,
        `${fixture.id}: indexed node thread_id was ${indexedTopNode.thread_id}`,
      );
    }
    if (Array.isArray(config.expected_topic_key_prefix)) {
      for (const [index, expectedKey] of config.expected_topic_key_prefix.entries()) {
        assert(
          topNode.topic_keys?.[index] === expectedKey,
          `${fixture.id}: expected topic_keys[${index}]=${expectedKey}, got ${topNode.topic_keys?.[index]}`,
        );
      }
    }
    if (config.expected_lifecycle_subject) {
      assert(
        topNode.lifecycle_transition?.subject === config.expected_lifecycle_subject,
        `${fixture.id}: lifecycle_transition.subject was ${topNode.lifecycle_transition?.subject}`,
      );
    }
    if (config.expected_source_ref_type) {
      assert(
        topNode.source_refs?.some(ref => ref.type === config.expected_source_ref_type),
        `${fixture.id}: missing source_refs type ${config.expected_source_ref_type}`,
      );
    }
    if (config.expected_rejected_option || config.expected_rejected_reason) {
      assert(
        queryPack.rejected_alternatives.some(item => (
          String(item.option || '').includes(config.expected_rejected_option)
          && String(item.reason || '').includes(config.expected_rejected_reason)
        )),
        `${fixture.id}: missing expected rejected alternative`,
      );
    }
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
      schema_version: 'tracework.decision_replay.v1',
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

    const { index: currentIndex } = buildDecisionIndex(tempVault, slug);
    const legacyBuilderIndex = structuredClone(currentIndex);
    delete legacyBuilderIndex.source.builder_version;
    legacyBuilderIndex.generated_at = '2999-01-01T00:00:00+00:00';
    legacyBuilderIndex.nodes = [{
      ...legacyBuilderIndex.nodes.find(node => node.id === config.expected_top_node),
      id: 'legacy-builder-sentinel',
    }];
    legacyBuilderIndex.edges = [];
    fs.writeFileSync(decisionPath, JSON.stringify(legacyBuilderIndex, null, 2), 'utf-8');
    const legacyBuilderPack = queryDecisionIndex(tempVault, slug, query, mode);
    assert(
      legacyBuilderPack.top_nodes?.[0]?.id === config.expected_top_node,
      `${fixture.id}: old builder index was reused instead of rebuilt`,
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

function runRoadmapThreadsFixture(fixture) {
  const config = fixture.fixture || {};
  const slug = config.project_slug;
  const { tempRoot, tempVault } = copyFixtureVault(config);

  try {
    const roadmapPack = roadmapDecisionIndex(tempVault, slug, config.limit_threads || 10);
    assert(roadmapPack.schema_version === 'tracework.decision_roadmap.v1', `${fixture.id}: bad roadmap schema`);
    assert(roadmapPack.project_slug === slug, `${fixture.id}: bad project slug`);
    assert(Array.isArray(roadmapPack.threads), `${fixture.id}: roadmap threads must be an array`);
    assert(
      roadmapPack.source?.node_count === config.expected_node_count,
      `${fixture.id}: expected node_count ${config.expected_node_count}, got ${roadmapPack.source?.node_count}`,
    );

    const validationThread = roadmapPack.threads.find(thread => thread.thread_id === config.expected_thread_id);
    assert(validationThread, `${fixture.id}: missing thread ${config.expected_thread_id}`);
    assert(validationThread.node_count === config.expected_thread_node_count, `${fixture.id}: bad validation node count`);
    assert(validationThread.confidence === config.expected_thread_confidence, `${fixture.id}: bad thread confidence`);
    assertSourceRefs(validationThread.decisions || [], fixture.id);
    for (const expectedId of config.expected_thread_decision_ids || []) {
      assert(
        validationThread.decisions?.some(node => node.id === expectedId),
        `${fixture.id}: thread missing decision ${expectedId}`,
      );
    }
    assert(
      validationThread.rejected_alternatives?.some(item => String(item.option || '').includes(config.expected_rejected_option)),
      `${fixture.id}: validation thread missing expected rejected alternative`,
    );
    assert(
      validationThread.open_questions?.some(item => String(item.question || '').includes(config.expected_open_question_text)),
      `${fixture.id}: validation thread missing expected open question`,
    );

    const retryThread = roadmapPack.threads.find(thread => thread.thread_id === config.expected_lifecycle_thread_id);
    assert(retryThread, `${fixture.id}: missing thread ${config.expected_lifecycle_thread_id}`);
    assert(
      retryThread.lifecycle_transitions?.some(item => item.subject === config.expected_lifecycle_subject),
      `${fixture.id}: retry thread missing lifecycle transition ${config.expected_lifecycle_subject}`,
    );
    assert(
      retryThread.decisions?.[0]?.source_refs?.some(ref => ref.type === config.expected_source_ref_type),
      `${fixture.id}: retry thread missing source_refs type ${config.expected_source_ref_type}`,
    );

    assert(
      roadmapPack.accumulating_risks?.some(item => String(item.risk || '').includes(config.expected_risk_text)),
      `${fixture.id}: roadmap pack missing accumulating risk`,
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

function runCaptureHelperRepairFixture(fixture) {
  const config = fixture.fixture || {};
  const slug = config.project_slug;
  const entry = config.entry;
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tracework-regression-'));
  const tempVault = path.join(tempRoot, 'vault');
  const entryPath = path.join(tempRoot, 'repair-entry.json');

  try {
    fs.mkdirSync(tempVault, { recursive: true });
    fs.writeFileSync(entryPath, JSON.stringify(entry, null, 2), 'utf-8');
    const appendResult = runJson('python3', [
      captureRaw,
      'append-entry',
      '--entry',
      entryPath,
      '--cwd',
      repoRoot,
      '--vault',
      tempVault,
      '--slug',
      slug,
      '--date',
      config.date,
    ]);

    assert(appendResult.week === config.expected_week, `${fixture.id}: wrote week ${appendResult.week}`);
    assert(appendResult.slug === slug, `${fixture.id}: wrote slug ${appendResult.slug}`);
    assert(appendResult.entries_appended === 1, `${fixture.id}: expected one appended entry`);
    assert(fs.existsSync(appendResult.path), `${fixture.id}: missing raw output ${appendResult.path}`);

    const entries = readJson(appendResult.path);
    assert(Array.isArray(entries), `${fixture.id}: raw output should be a JSON array`);
    assert(entries.length === 1, `${fixture.id}: expected exactly one raw entry`);
    const appended = entries[0] || {};

    assert(appended.source === 'session-recap', `${fixture.id}: expected source=session-recap`);
    assert(appended.archetype === 'repair', `${fixture.id}: expected archetype=repair`);
    assert(String(appended.root_cause || '').includes('export time'), `${fixture.id}: root_cause lost late export guard`);
    assert(String(appended.root_cause || '').includes('validation repair loop'), `${fixture.id}: root_cause lost repair-loop ownership`);
    assert(
      Array.isArray(appended.exploration_paths)
        && appended.exploration_paths.some(item => String(item).includes('export fallback'))
        && appended.exploration_paths.some(item => String(item).includes('upfront validation')),
      `${fixture.id}: exploration_paths should preserve both compared paths`,
    );
    assert(
      Array.isArray(appended.abandoned_alternatives)
        && appended.abandoned_alternatives.some(item => String(item).includes('Export fallback only')),
      `${fixture.id}: abandoned_alternatives should preserve rejected fallback-only path`,
    );
    assert(typeof appended.impact === 'string' && appended.impact.length > 0, `${fixture.id}: missing impact`);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function runExecutableFixture(fixture) {
  const kind = fixture.execution?.kind || 'documented-only';
  if (kind === 'capture-helper-repair') {
    runCaptureHelperRepairFixture(fixture);
  } else if (kind === 'query-positive') {
    runQueryPositiveFixture(fixture);
  } else if (kind === 'query-negative') {
    runQueryNegativeFixture(fixture);
  } else if (kind === 'query-index-fallback') {
    runQueryIndexFallbackFixture(fixture);
  } else if (kind === 'recall-rebuild') {
    runRecallRebuildFixture(fixture);
  } else if (kind === 'roadmap-threads') {
    runRoadmapThreadsFixture(fixture);
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
