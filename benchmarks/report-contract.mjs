import assert from 'node:assert/strict';

const DIAGRAM_TYPES = new Set([
  'sequence',
  'swimlane',
  'data_flow',
  'decision_tree',
  'failure_path',
  'state_machine',
  'architecture',
]);

const RESULT_CHART_TYPES = new Set([
  'number_card',
  'comparison_chart',
  'distribution_chart',
  'trend_chart',
  'timeline_chart',
  'waterfall_chart',
]);

const MATURITY_STATES = new Set(['yes', 'partial', 'no', 'not_applicable']);
const GOAL_CONFIDENCE = new Set(['confirmed', 'inferred', 'unknown']);
const GOAL_STATUSES = new Set(['met', 'advanced', 'blocked', 'replanned', 'not_started']);
const COMMITMENT_STATES = new Set(['confirmed', 'proposed']);
const GOAL_SOURCE_CONFIDENCE = new Map([
  ['current_request', 'confirmed'],
  ['previous_weekly', 'confirmed'],
  ['goal_artifact', 'confirmed'],
  ['raw_inference', 'inferred'],
  ['unknown', 'unknown'],
]);
const MANAGEMENT_FIELDS = new Set([
  'goal_state',
  'actual_change',
  'material_variance',
  'decision_or_support',
  'next_commitment',
  'confidence_boundary',
]);
const DIRECT_VALIDATION_KINDS = new Set(['test', 'smoke_test', 'benchmark', 'observed', 'recorded']);
const SERIES_CHART_TYPES = new Set(['distribution_chart', 'trend_chart', 'timeline_chart', 'waterfall_chart']);
const MAX_NARRATIVE_CHARACTERS = 600;
const LOGIC_LIST_LIMITS = {
  actors: 12,
  main_flow: 12,
  branches: 8,
  fallbacks: 8,
  invariants: 8,
  evidence_refs: 24,
};

function present(value) {
  return typeof value === 'string' ? Boolean(value.trim()) : value !== null && value !== undefined;
}

function nonEmptyString(value) {
  return typeof value === 'string' && Boolean(value.trim());
}

function nonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(nonEmptyString);
}

function normalizeNarrativeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const NARRATIVE_PRESENTATION_LABELS = [
  'normal path',
  'branch and fallback',
  'outcome and invariant',
  'implementation narrative',
  'step',
  '正常路径',
  '分支与回退',
  '输出与约束',
  '实施说明',
];

function narrativeIsOnlyLogicLabels(value, result) {
  const logic = result.solution_logic || {};
  const arrays = [logic.actors, logic.main_flow, logic.branches, logic.fallbacks, logic.invariants]
    .filter(Array.isArray);
  const fragments = [result.title, logic.trigger, logic.output, logic.remaining_boundary];
  for (const values of arrays) {
    fragments.push(...values);
  }
  let remaining = normalizeNarrativeText(value);
  for (const label of NARRATIVE_PRESENTATION_LABELS) {
    remaining = remaining.split(normalizeNarrativeText(label)).join(' ');
  }
  const normalizedFragments = [...new Set(fragments.map(normalizeNarrativeText).filter(Boolean))]
    .sort((left, right) => right.length - left.length);
  for (const fragment of normalizedFragments) {
    remaining = remaining.split(fragment).join(' ');
  }
  return !normalizeNarrativeText(remaining);
}

function containsForbiddenMainDeckReference(value) {
  const text = String(value || '');
  return /[\u0000-\u001f\u007f-\u009f]/.test(text)
    || /!?\[[^\]]*\]\([^)]*\)/.test(text)
    || /<\/?[A-Za-z][^>]*>/.test(text)
    || /https?:\/\//i.test(text)
    || /(^|[\s(])\/\/[A-Za-z0-9.-]+(?:\/|$)/.test(text)
    || /\bfile:/i.test(text)
    || /%(?:2f|5c)/i.test(text)
    || /\b[A-Za-z]:[\\/][^\s]+/.test(text)
    || /(^|\s)\/(?:[^/\s]+\/)+[^/\s]+/.test(text)
    || /(?:[\w.-]+[\\/]){2,}[\w.-]+(?::\d+)?/.test(text)
    || /\b(?=[0-9a-f]{7,40}\b)(?=[0-9a-f]*[a-f])(?=[0-9a-f]*\d)[0-9a-f]{7,40}\b/i.test(text)
    || /\b[OWDE]\d+\b/.test(text);
}

function validateImplementationNarrative(result, fixtureId, audience) {
  const significance = result.solution_logic?.significance;
  const narrative = result.implementation_narrative;

  if (!significance || significance === 'none') {
    assert(
      narrative === null || narrative === undefined,
      `${fixtureId}: ${result.id} non-mechanism result gained implementation narrative`,
    );
    return false;
  }

  if (significance === 'supporting' && (narrative === null || narrative === undefined)) {
    return false;
  }

  assert(
    narrative && typeof narrative === 'object' && !Array.isArray(narrative),
    `${fixtureId}: ${result.id} implementation narrative is missing`,
  );
  const normalizedBlocks = [];
  for (const field of ['normal_path', 'branch_and_fallback', 'outcome_and_invariant']) {
    assert(nonEmptyString(narrative[field]), `${fixtureId}: ${result.id} implementation narrative ${field} is missing`);
    const normalized = normalizeNarrativeText(narrative[field]);
    assert(normalized, `${fixtureId}: ${result.id} implementation narrative ${field} has no substantive text`);
    assert(
      [...narrative[field]].length <= MAX_NARRATIVE_CHARACTERS,
      `${fixtureId}: ${result.id} implementation narrative ${field} exceeds the main-deck size limit`,
    );
    assert(
      !narrativeIsOnlyLogicLabels(narrative[field], result),
      `${fixtureId}: ${result.id} implementation narrative ${field} only repeats logic labels`,
    );
    if (audience === 'department_ic') {
      assert(
        !containsForbiddenMainDeckReference(narrative[field]),
        `${fixtureId}: ${result.id} implementation narrative ${field} leaks an internal reference`,
      );
    }
    normalizedBlocks.push(normalized);
  }
  assert(new Set(normalizedBlocks).size === normalizedBlocks.length, `${fixtureId}: ${result.id} implementation narrative blocks must be distinct`);
  return true;
}

function validateStateTransition(result, fixtureId) {
  const transition = result.state_transition;
  if (transition === null || transition === undefined) return false;
  assert(typeof transition === 'object' && !Array.isArray(transition), `${fixtureId}: ${result.id} state transition must be an object`);
  for (const field of ['before', 'intervention', 'after', 'remaining_gate']) {
    assert(nonEmptyString(transition[field]), `${fixtureId}: ${result.id} state transition ${field} is missing`);
  }
  assert(nonEmptyStringArray(transition.evidence_refs), `${fixtureId}: ${result.id} state transition evidence is missing`);
  return true;
}

function validateMaturity(result, fixtureId) {
  const maturity = result.result_maturity;
  assert(maturity && typeof maturity === 'object' && !Array.isArray(maturity), `${fixtureId}: ${result.id} maturity is missing`);
  for (const field of ['mechanism_complete', 'effect_validated', 'production_accepted']) {
    assert(MATURITY_STATES.has(maturity[field]), `${fixtureId}: ${result.id} invalid maturity ${field}`);
  }
  if (Object.values(maturity).some((value) => value === 'partial' || value === 'no')) {
    assert(nonEmptyString(result.closure_criterion), `${fixtureId}: ${result.id} incomplete maturity lacks a closure criterion`);
  }
}

function validateMetricEvidence(result, fixtureId) {
  const metrics = Array.isArray(result.metric_evidence) ? result.metric_evidence : [];
  const isResultChart = RESULT_CHART_TYPES.has(result.visual_kind);
  if (isResultChart) {
    assert(result.effect_data_available === true, `${fixtureId}: ${result.id} result chart lacks available effect data`);
    assert(metrics.length > 0, `${fixtureId}: ${result.id} result chart has no metric evidence`);
  }
  if (metrics.length > 0) {
    for (const metric of metrics) {
      assert(nonEmptyString(metric.metric_name), `${fixtureId}: ${result.id} metric name is missing`);
      assert(typeof metric.current === 'number', `${fixtureId}: ${result.id} current must be numeric`);
      assert(nonEmptyString(metric.unit), `${fixtureId}: ${result.id} metric unit is missing`);
      assert(nonEmptyString(metric.sample_scope), `${fixtureId}: ${result.id} sample scope is missing`);
      assert(nonEmptyString(metric.evaluation_method), `${fixtureId}: ${result.id} evaluation method is missing`);
      assert(['observed', 'recorded'].includes(metric.impact_boundary), `${fixtureId}: ${result.id} result chart uses non-observed impact`);
      assert(['verified', 'recorded'].includes(metric.evidence_grade), `${fixtureId}: ${result.id} result chart has insufficient evidence grade`);
      assert(nonEmptyStringArray(metric.source_refs), `${fixtureId}: ${result.id} metric source refs are missing`);
      if (SERIES_CHART_TYPES.has(result.visual_kind)) {
        assert(Array.isArray(metric.data_points) && metric.data_points.length >= 2, `${fixtureId}: ${result.id} series chart needs at least two data points`);
        for (const point of metric.data_points) {
          assert(nonEmptyString(point?.label), `${fixtureId}: ${result.id} data point label is missing`);
          assert(typeof point?.value === 'number', `${fixtureId}: ${result.id} data point value must be numeric`);
        }
      }
      if (result.visual_kind === 'comparison_chart'
        || present(metric.baseline)
        || present(metric.delta)) {
        assert(typeof metric.baseline === 'number', `${fixtureId}: ${result.id} baseline must be numeric`);
        assert(typeof metric.delta === 'number', `${fixtureId}: ${result.id} delta must be numeric`);
        assert(
          Math.abs((metric.current - metric.baseline) - metric.delta) < 1e-9,
          `${fixtureId}: ${result.id} metric delta is inconsistent`,
        );
        assert(metric.comparable === true, `${fixtureId}: ${result.id} comparison is not marked comparable`);
      }
    }
  }

  if (result.metric_conflict === true) {
    assert(
      !isResultChart,
      `${fixtureId}: ${result.id} conflicting metrics must not produce a result chart`,
    );
    assert(result.evidence_grade === 'limited', `${fixtureId}: ${result.id} metric conflict must be limited`);
    assert(present(result.closure_criterion), `${fixtureId}: ${result.id} metric conflict lacks a closure criterion`);
  }

  if (result.effect_data_available === false) {
    assert(
      !isResultChart,
      `${fixtureId}: ${result.id} missing effect data produced a result chart`,
    );
    assert(metrics.length === 0, `${fixtureId}: ${result.id} missing effect data contains metric evidence`);
    assert(present(result.measurement_plan), `${fixtureId}: ${result.id} missing effect data lacks a measurement plan`);
    assert(present(result.closure_criterion), `${fixtureId}: ${result.id} missing effect data lacks a closure criterion`);
  }

  return metrics.length > 0;
}

function validateSolutionLogic(result, fixtureId, expectedRoutes) {
  const logic = result.solution_logic;
  if (!logic || logic.significance === 'none') return false;

  assert(['supporting', 'core'].includes(logic.significance), `${fixtureId}: ${result.id} invalid solution significance`);
  assert(nonEmptyString(logic.trigger), `${fixtureId}: ${result.id} solution trigger is missing`);
  assert(nonEmptyStringArray(logic.actors), `${fixtureId}: ${result.id} actors are missing`);
  assert(nonEmptyStringArray(logic.main_flow) && logic.main_flow.length >= 2, `${fixtureId}: ${result.id} main flow is incomplete`);
  assert(Array.isArray(logic.branches) && logic.branches.every(nonEmptyString), `${fixtureId}: ${result.id} branches must contain text`);
  assert(Array.isArray(logic.fallbacks) && logic.fallbacks.every(nonEmptyString), `${fixtureId}: ${result.id} fallbacks must contain text`);
  assert(nonEmptyString(logic.output), `${fixtureId}: ${result.id} output is missing`);
  assert(nonEmptyStringArray(logic.invariants), `${fixtureId}: ${result.id} invariants are missing`);
  assert(nonEmptyString(logic.remaining_boundary), `${fixtureId}: ${result.id} remaining boundary is missing`);
  assert(DIAGRAM_TYPES.has(logic.recommended_diagram), `${fixtureId}: ${result.id} invalid diagram type`);
  assert(nonEmptyStringArray(logic.evidence_refs), `${fixtureId}: ${result.id} logic evidence is missing`);
  for (const [field, limit] of Object.entries(LOGIC_LIST_LIMITS)) {
    assert(logic[field].length <= limit, `${fixtureId}: ${result.id} solution logic ${field} exceeds ${limit} items`);
  }

  if (logic.significance === 'core') {
    assert(logic.branches.length > 0, `${fixtureId}: ${result.id} core solution branches are missing`);
    assert(logic.fallbacks.length > 0, `${fixtureId}: ${result.id} core solution fallbacks are missing`);
    assert(validateStateTransition(result, fixtureId), `${fixtureId}: ${result.id} core solution lacks Before/After`);
    assert(
      (Array.isArray(result.metric_evidence) && result.metric_evidence.length > 0)
        || (nonEmptyString(result.validation_result) && DIRECT_VALIDATION_KINDS.has(result.effect_evidence_kind)),
      `${fixtureId}: ${result.id} core solution lacks independent result validation`,
    );
    assert(
      result.effect_evidence_kind !== 'solution_logic',
      `${fixtureId}: ${result.id} uses solution logic as effectiveness evidence`,
    );
  }

  if (expectedRoutes[result.id]) {
    assert(
      logic.recommended_diagram === expectedRoutes[result.id],
      `${fixtureId}: ${result.id} expected ${expectedRoutes[result.id]} diagram, got ${logic.recommended_diagram}`,
    );
  }
  return true;
}

function validateSlideContract(fixture, output, group) {
  const fixtureId = fixture.id;
  const projection = group.slide_projection || {};
  assert(
    ['department_ic', 'technical_review'].includes(projection.audience),
    `${fixtureId}: invalid or missing slide audience`,
  );
  assert(
    Number.isInteger(projection.main_deck_slide_count)
      && projection.main_deck_slide_count >= 6
      && projection.main_deck_slide_count <= 10,
    `${fixtureId}: main deck must contain 6-10 slides`,
  );
  assert(
    nonEmptyStringArray(projection.main_deck_slide_titles)
      && projection.main_deck_slide_titles.length === projection.main_deck_slide_count,
    `${fixtureId}: declared slide count does not match the composed slide titles`,
  );
  assert(
    new Set(projection.main_deck_slide_titles.map(normalizeNarrativeText)).size === projection.main_deck_slide_titles.length,
    `${fixtureId}: main-deck slide titles must be distinct`,
  );
  if (projection.audience === 'department_ic') {
    for (const title of projection.main_deck_slide_titles) {
      assert(!containsForbiddenMainDeckReference(title), `${fixtureId}: main-deck slide title contains an unsafe or internal reference`);
    }
  }

  const results = Array.isArray(projection.results) ? projection.results : [];
  assert(results.length > 0, `${fixtureId}: slide projection has no results`);
  assert(results.length <= 4, `${fixtureId}: slide projection exceeds the headline-result budget`);
  const resultIds = results.map((result) => result.id);
  assert(resultIds.every(nonEmptyString), `${fixtureId}: result id is missing`);
  assert(new Set(resultIds).size === resultIds.length, `${fixtureId}: duplicate result id`);
  const resultById = new Map(results.map((result) => [result.id, result]));
  const headlines = Array.isArray(group.headlines) ? group.headlines : [];
  assert.deepEqual(new Set(resultIds), new Set(headlines), `${fixtureId}: slide results must match selected headlines`);
  const logicIds = Array.isArray(projection.main_deck_logic_diagram_ids)
    ? projection.main_deck_logic_diagram_ids
    : [];
  assert(logicIds.length <= 3, `${fixtureId}: main deck has more than three solution-logic diagrams`);
  assert(new Set(logicIds).size === logicIds.length, `${fixtureId}: duplicate main-deck logic diagram id`);

  const coreResultIds = Array.isArray(projection.core_result_ids) ? projection.core_result_ids : [];
  assert(coreResultIds.length <= 3, `${fixtureId}: main deck has more than three core results`);
  assert(new Set(coreResultIds).size === coreResultIds.length, `${fixtureId}: duplicate core result id`);

  const expectedRoutes = fixture.fixture?.expected_diagram_routes || {};
  for (const result of results) {
    assert(present(result.title), `${fixtureId}: ${result.id} result title is missing`);
    assert(result.title_style === 'conclusion', `${fixtureId}: ${result.id} title is not conclusion-led`);
    if (projection.audience === 'department_ic') {
      assert(!containsForbiddenMainDeckReference(result.title), `${fixtureId}: ${result.id} result title contains an unsafe or internal reference`);
    }
    const hasMetricEvidence = validateMetricEvidence(result, fixtureId);
    validateMaturity(result, fixtureId);
    const hasTransition = validateStateTransition(result, fixtureId);
    const hasLogic = validateSolutionLogic(result, fixtureId, expectedRoutes);
    const hasImplementationNarrative = validateImplementationNarrative(result, fixtureId, projection.audience);
    const hasDirectValidation = nonEmptyString(result.validation_result)
      && DIRECT_VALIDATION_KINDS.has(result.effect_evidence_kind);
    const triadCoverage = [hasTransition, hasLogic, hasMetricEvidence || hasDirectValidation].filter(Boolean).length;
    assert(triadCoverage >= 2, `${fixtureId}: ${result.id} covers fewer than two presentation-contract parts`);
    if (result.solution_logic?.significance === 'core') {
      assert(triadCoverage === 3, `${fixtureId}: ${result.id} core solution must cover all three presentation-contract parts`);
      assert(hasImplementationNarrative, `${fixtureId}: ${result.id} core solution lacks implementation narrative`);
      assert(coreResultIds.includes(result.id), `${fixtureId}: ${result.id} core solution is missing from core_result_ids`);
      assert(logicIds.includes(result.id), `${fixtureId}: ${result.id} core solution is missing from the main deck`);
    }
    if (logicIds.includes(result.id)) {
      assert(hasLogic, `${fixtureId}: ${result.id} is routed as a logic diagram without solution logic`);
    }
  }


  for (const id of coreResultIds) {
    assert(resultById.has(id), `${fixtureId}: unknown core result ${id}`);
    assert(resultById.get(id).solution_logic?.significance === 'core', `${fixtureId}: ${id} is not classified as a core solution`);
  }

  for (const id of Object.keys(expectedRoutes)) {
    assert(resultById.has(id), `${fixtureId}: expected solution result ${id} is missing`);
    assert(coreResultIds.includes(id), `${fixtureId}: expected core solution ${id} is not selected as core`);
  }

  for (const id of logicIds) {
    assert(resultById.has(id), `${fixtureId}: unknown main-deck logic diagram ${id}`);
    assert(coreResultIds.includes(id), `${fixtureId}: supporting solution ${id} must remain in the technical appendix`);
  }

  for (const id of fixture.fixture?.expected_no_logic_ids || []) {
    assert(!logicIds.includes(id), `${fixtureId}: maintenance item ${id} was forced into a logic diagram`);
    assert(resultById.get(id)?.solution_logic?.significance === 'none', `${fixtureId}: maintenance result ${id} gained decorative logic`);
  }

  for (const id of fixture.fixture?.expected_portfolio_ids || []) {
    assert(group.portfolio.includes(id), `${fixtureId}: maintenance item ${id} is missing from the portfolio`);
  }
}

export function validateReportContract(fixture) {
  const config = fixture.fixture || {};
  const output = config.candidate_output || {};
  if (present(output.format)) {
    assert(['brief', 'slides'].includes(output.format), `${fixture.id}: invalid report format`);
  }
  const groups = Array.isArray(output.groups) ? output.groups : [];
  assert(groups.length > 0, `${fixture.id}: no reporting groups`);

  const seenGroups = new Set();
  for (const group of groups) {
    assert(typeof group.name === 'string' && group.name, `${fixture.id}: missing group name`);
    assert(!seenGroups.has(group.name), `${fixture.id}: duplicate group ${group.name}`);
    seenGroups.add(group.name);
    assert(typeof group.judgment === 'string' && group.judgment.trim(), `${fixture.id}: missing group judgment`);

    const headlines = Array.isArray(group.headlines) ? group.headlines : [];
    assert(headlines.length >= 1, `${fixture.id}: report has no material changes`);
    const portfolio = Array.isArray(group.portfolio) ? group.portfolio : [];
    const covered = new Set([...headlines, ...portfolio]);
    for (const stream of group.all_streams || []) {
      assert(covered.has(stream), `${fixture.id}: uncovered stream ${stream}`);
    }

    const targets = Array.isArray(group.next_closure_targets) ? group.next_closure_targets : [];
    if (output.format === 'slides') {
      for (const target of targets) {
        assert(target && typeof target === 'object' && !Array.isArray(target), `${fixture.id}: slide closure target must be structured`);
        assert(nonEmptyString(target.target), `${fixture.id}: slide closure target name is missing`);
        assert(nonEmptyString(target.closure_criterion), `${fixture.id}: slide closure target criterion is missing`);
      }
      validateSlideContract(fixture, output, group);
    }
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

function validateGoalLoopOutput(fixture, output) {
  const groups = Array.isArray(output.groups) ? output.groups : [];
  assert(groups.length > 0, `${fixture.id}: no reporting groups`);

  for (const group of groups) {
    assert(nonEmptyString(group.name), `${fixture.id}: missing group name`);
    const goals = Array.isArray(group.goals) ? group.goals : [];
    assert(goals.length > 0, `${fixture.id}: ${group.name} has no goal lane`);
    const goalIds = new Set();
    for (const goal of goals) {
      assert(nonEmptyString(goal.id), `${fixture.id}: goal id is missing`);
      assert(!goalIds.has(goal.id), `${fixture.id}: duplicate goal ${goal.id}`);
      goalIds.add(goal.id);
      assert(nonEmptyString(goal.statement), `${fixture.id}: ${goal.id} statement is missing`);
      assert(GOAL_CONFIDENCE.has(goal.confidence), `${fixture.id}: ${goal.id} confidence is invalid`);
      assert(GOAL_STATUSES.has(goal.status), `${fixture.id}: ${goal.id} status is invalid`);
      assert(COMMITMENT_STATES.has(goal.commitment_state), `${fixture.id}: ${goal.id} commitment state is invalid`);
      assert(nonEmptyString(goal.closure_criterion), `${fixture.id}: ${goal.id} closure criterion is missing`);
      const sourceKind = goal.source?.kind;
      assert(GOAL_SOURCE_CONFIDENCE.has(sourceKind), `${fixture.id}: ${goal.id} source is invalid`);
      const expectedConfidence = sourceKind === 'previous_weekly' && goal.commitment_state === 'proposed'
        ? 'inferred'
        : GOAL_SOURCE_CONFIDENCE.get(sourceKind);
      assert(
        goal.confidence === expectedConfidence,
        `${fixture.id}: ${goal.id} confidence contradicts its source`,
      );
    }

    const priorCommitments = Array.isArray(group.prior_commitments) ? group.prior_commitments : [];
    for (const item of priorCommitments) {
      assert(nonEmptyString(item.statement), `${fixture.id}: prior commitment statement is missing`);
      assert(COMMITMENT_STATES.has(item.commitment_state), `${fixture.id}: prior commitment state is invalid`);
      assert(GOAL_STATUSES.has(item.status), `${fixture.id}: prior commitment status is invalid`);
      assert(goalIds.has(item.goal_id), `${fixture.id}: prior commitment references unknown goal ${item.goal_id}`);
      assert(nonEmptyString(item.reason), `${fixture.id}: prior commitment reason is missing`);
    }

    const changes = Array.isArray(group.material_changes) ? group.material_changes : [];
    const changeIds = new Set();
    for (const change of changes) {
      assert(nonEmptyString(change.id), `${fixture.id}: material change id is missing`);
      assert(!changeIds.has(change.id), `${fixture.id}: duplicate material change ${change.id}`);
      changeIds.add(change.id);
      const linkedGoals = Array.isArray(change.goal_ids) ? change.goal_ids : [];
      assert(
        linkedGoals.length > 0 || change.variance?.kind === 'unplanned',
        `${fixture.id}: ${change.id} is neither goal-linked nor explicitly unplanned`,
      );
      for (const goalId of linkedGoals) {
        assert(goalIds.has(goalId), `${fixture.id}: ${change.id} references unknown goal ${goalId}`);
      }
      if (change.variance?.kind === 'replanned') {
        for (const field of ['prior_direction', 'trigger', 'reason', 'new_direction']) {
          assert(nonEmptyString(change.variance[field]), `${fixture.id}: ${change.id} replan ${field} is missing`);
        }
      }
    }

    const portfolio = new Set(Array.isArray(group.portfolio) ? group.portfolio : []);
    for (const changeId of group.all_changes || []) {
      assert(changeIds.has(changeId) || portfolio.has(changeId), `${fixture.id}: uncovered change ${changeId}`);
    }

    const nextCommitments = Array.isArray(group.next_commitments) ? group.next_commitments : [];
    for (const item of nextCommitments) {
      assert(nonEmptyString(item.statement), `${fixture.id}: next commitment statement is missing`);
      assert(COMMITMENT_STATES.has(item.commitment_state), `${fixture.id}: next commitment state is invalid`);
      assert(nonEmptyString(item.closure_criterion), `${fixture.id}: next commitment criterion is missing`);
    }

    if (fixture.fixture?.expected_min_goal_lanes) {
      assert(
        goals.length >= fixture.fixture.expected_min_goal_lanes,
        `${fixture.id}: unrelated projects were forced into one goal lane`,
      );
    }

    const narrative = String(group.narrative || '');
    if (goals.some((goal) => goal.confidence !== 'confirmed')) {
      assert(!/(原定目标|本周承诺|confirmed goal)/i.test(narrative), `${fixture.id}: uncertain goal uses confirmed language`);
    }
  }

  if (output.scope === 'work') {
    assert.deepEqual(groups.map((group) => group.name), ['work'], `${fixture.id}: work scope must contain only work`);
    const serialized = JSON.stringify(output).toLowerCase();
    for (const forbidden of fixture.fixture?.forbidden_terms || []) {
      assert(!serialized.includes(String(forbidden).toLowerCase()), `${fixture.id}: work output leaked ${forbidden}`);
    }
  }
}

export function validateWeeklyGoalLoopContract(fixture) {
  const outputs = fixture.fixture?.candidate_outputs
    || [fixture.fixture?.candidate_output];
  assert(outputs.every(Boolean), `${fixture.id}: goal-loop candidate output is missing`);
  for (const output of outputs) validateGoalLoopOutput(fixture, output);

  if (fixture.fixture?.expected_distinct_rankings) {
    const rankings = outputs.map((output) => output.groups[0].material_changes.map((change) => change.id).join('|'));
    assert(new Set(rankings).size === rankings.length, `${fixture.id}: different goals produced the same change ranking`);
  }

  if (fixture.fixture?.expected_distinct_narratives) {
    const narratives = outputs.map((output) => normalizeNarrativeText(output.groups[0].narrative));
    assert(new Set(narratives).size === narratives.length, `${fixture.id}: different goals produced the same management meaning`);
  }

  for (const [changeId, closureType] of Object.entries(fixture.fixture?.expected_change_closure_types || {})) {
    const changes = outputs.flatMap((output) => output.groups.flatMap((group) => group.material_changes || []));
    assert(
      changes.some((change) => change.id === changeId && change.closure_type === closureType),
      `${fixture.id}: ${changeId} did not preserve closure type ${closureType}`,
    );
  }

  for (const expected of fixture.fixture?.expected_prior_statements || []) {
    const accounted = outputs[0].groups.flatMap((group) => group.prior_commitments || []);
    assert(accounted.some((item) => item.statement === expected), `${fixture.id}: prior commitment disappeared: ${expected}`);
  }
}

function validateBriefCompressionOutput(fixture, output) {
  assert(nonEmptyString(output.name), `${fixture.id}: compression output name is missing`);
  const model = output.management_model || {};
  for (const field of MANAGEMENT_FIELDS) {
    assert(nonEmptyString(model[field]), `${fixture.id}:${output.name}: management model ${field} is missing`);
  }

  const requiredDeltaIds = new Set(model.required_delta_ids || []);
  assert(requiredDeltaIds.size > 0, `${fixture.id}:${output.name}: required management deltas are missing`);
  const bodyBlocks = Array.isArray(output.body_blocks) ? output.body_blocks : [];
  assert(bodyBlocks.length > 0, `${fixture.id}:${output.name}: brief body is empty`);
  const coveredFields = new Set();
  const deltaCounts = new Map();
  const bodyItemRefs = new Set();
  const blockIds = new Set();
  for (const block of bodyBlocks) {
    assert(nonEmptyString(block.id), `${fixture.id}:${output.name}: body block id is missing`);
    assert(!blockIds.has(block.id), `${fixture.id}:${output.name}: duplicate body block ${block.id}`);
    blockIds.add(block.id);
    assert(nonEmptyString(block.text), `${fixture.id}:${output.name}:${block.id}: body text is missing`);
    assert(!/(^|\n)\s*\|.+\|\s*(\n|$)/.test(block.text), `${fixture.id}:${output.name}:${block.id}: body contains a table`);
    assert(!containsForbiddenMainDeckReference(block.text), `${fixture.id}:${output.name}:${block.id}: body leaks provenance`);
    const covers = Array.isArray(block.covers) ? block.covers : [];
    assert(covers.length > 0, `${fixture.id}:${output.name}:${block.id}: body block changes no management field`);
    for (const field of covers) {
      assert(MANAGEMENT_FIELDS.has(field), `${fixture.id}:${output.name}:${block.id}: invalid management field ${field}`);
      coveredFields.add(field);
    }
    const deltaIds = Array.isArray(block.delta_ids) ? block.delta_ids : [];
    assert(deltaIds.length > 0, `${fixture.id}:${output.name}:${block.id}: body block has no decision delta`);
    for (const deltaId of deltaIds) {
      assert(requiredDeltaIds.has(deltaId), `${fixture.id}:${output.name}:${block.id}: non-required delta ${deltaId} entered the body`);
      deltaCounts.set(deltaId, (deltaCounts.get(deltaId) || 0) + 1);
    }
    for (const itemRef of block.item_refs || []) bodyItemRefs.add(itemRef);
  }
  assert.deepEqual(coveredFields, MANAGEMENT_FIELDS, `${fixture.id}:${output.name}: body cannot reconstruct the management model`);
  for (const deltaId of requiredDeltaIds) {
    assert(deltaCounts.get(deltaId) === 1, `${fixture.id}:${output.name}: decision delta ${deltaId} is missing or repeated`);
  }
  for (const block of bodyBlocks) {
    assert(
      block.delta_ids.some((deltaId) => deltaCounts.get(deltaId) === 1),
      `${fixture.id}:${output.name}:${block.id}: block fails the counterfactual deletion test`,
    );
  }
  for (const itemId of output.body_required_item_ids || []) {
    assert(bodyItemRefs.has(itemId), `${fixture.id}:${output.name}: material item ${itemId} exists only in the appendix`);
  }

  const appendix = output.appendix || {};
  const priorItems = new Set(appendix.prior_item_ids || []);
  for (const itemId of output.all_prior_item_ids || []) {
    assert(priorItems.has(itemId), `${fixture.id}:${output.name}: prior item ${itemId} is missing from the appendix`);
  }
  const workStreams = new Set(appendix.work_stream_ids || []);
  for (const streamId of output.all_work_stream_ids || []) {
    assert(workStreams.has(streamId), `${fixture.id}:${output.name}: work stream ${streamId} is missing from the appendix`);
  }

  const claimEvidence = Array.isArray(appendix.claim_evidence) ? appendix.claim_evidence : [];
  const evidenceByClaim = new Map(claimEvidence.map((claim) => [claim.claim_id, claim]));
  for (const block of bodyBlocks) {
    const claim = evidenceByClaim.get(block.id);
    assert(claim, `${fixture.id}:${output.name}:${block.id}: body claim has no appendix evidence mapping`);
    assert(nonEmptyString(claim.label), `${fixture.id}:${output.name}:${block.id}: evidence label is missing`);
    assert(nonEmptyStringArray(claim.evidence_refs), `${fixture.id}:${output.name}:${block.id}: evidence refs are missing`);
    assert(
      normalizeNarrativeText(claim.label) !== normalizeNarrativeText(block.text),
      `${fixture.id}:${output.name}:${block.id}: appendix repeats the body narrative`,
    );
  }
}

function compressionBodyFingerprint(output) {
  return output.body_blocks.map((block) => `${block.id}:${normalizeNarrativeText(block.text)}`).join('|');
}

function appendixSignalCount(output) {
  const appendix = output.appendix || {};
  return (appendix.prior_item_ids || []).length
    + (appendix.work_stream_ids || []).length
    + (appendix.claim_evidence || []).reduce((total, claim) => total + (claim.evidence_refs || []).length, 0);
}

export function validateWeeklyBriefCompressionContract(fixture) {
  const outputs = fixture.fixture?.candidate_outputs || [];
  assert(outputs.length > 0, `${fixture.id}: compression candidates are missing`);
  const byName = new Map();
  for (const output of outputs) {
    validateBriefCompressionOutput(fixture, output);
    assert(!byName.has(output.name), `${fixture.id}: duplicate compression output ${output.name}`);
    byName.set(output.name, output);
  }

  for (const [baselineName, variantName] of fixture.fixture?.expected_same_body_pairs || []) {
    const baseline = byName.get(baselineName);
    const variant = byName.get(variantName);
    assert(baseline && variant, `${fixture.id}: unknown same-body comparison`);
    assert.equal(
      compressionBodyFingerprint(variant),
      compressionBodyFingerprint(baseline),
      `${fixture.id}: ${variantName} changed the body without changing management meaning`,
    );
  }
  for (const [baselineName, variantName] of fixture.fixture?.expected_different_body_pairs || []) {
    const baseline = byName.get(baselineName);
    const variant = byName.get(variantName);
    assert(baseline && variant, `${fixture.id}: unknown different-body comparison`);
    assert.notEqual(
      compressionBodyFingerprint(variant),
      compressionBodyFingerprint(baseline),
      `${fixture.id}: ${variantName} failed to surface a management change`,
    );
  }
  for (const [baselineName, variantName] of fixture.fixture?.expected_appendix_growth_pairs || []) {
    const baseline = byName.get(baselineName);
    const variant = byName.get(variantName);
    assert(baseline && variant, `${fixture.id}: unknown appendix-growth comparison`);
    assert(
      appendixSignalCount(variant) > appendixSignalCount(baseline),
      `${fixture.id}: ${variantName} did not preserve added accountability or evidence in the appendix`,
    );
  }
}

export function validateReportContractRejectionProbes(fixture) {
  const probes = fixture.fixture?.rejection_probes || [];
  for (const probe of probes) {
    const mutant = structuredClone(fixture);
    mutant.id = `${fixture.id}:${probe}`;
    const group = mutant.fixture.candidate_output.groups[0];
    const projection = group.slide_projection;
    const firstResult = projection?.results?.[0];

    if (probe === 'omit-results') {
      projection.results = [];
      projection.core_result_ids = [];
      projection.main_deck_logic_diagram_ids = [];
    } else if (probe === 'hollow-core') {
      firstResult.state_transition = {};
      firstResult.solution_logic.actors = [''];
      firstResult.solution_logic.main_flow = ['', ''];
      firstResult.solution_logic.branches = [''];
      firstResult.solution_logic.fallbacks = [''];
      firstResult.solution_logic.invariants = [''];
      firstResult.solution_logic.evidence_refs = [''];
    } else if (probe === 'trend-without-metrics') {
      firstResult.visual_kind = 'trend_chart';
      firstResult.effect_data_available = true;
      firstResult.metric_evidence = [];
    } else if (probe === 'decorative-maintenance-logic') {
      firstResult.solution_logic = {
        significance: 'supporting',
        trigger: 'cleanup',
        actors: ['module', 'helper'],
        main_flow: ['remove duplicate', 'run tests'],
        branches: [],
        fallbacks: [],
        output: 'smaller code surface',
        invariants: ['runtime behavior remains unchanged'],
        remaining_boundary: 'clean package smoke remains open',
        recommended_diagram: 'architecture',
        evidence_refs: ['test:maintenance'],
      };
      projection.main_deck_logic_diagram_ids = [firstResult.id];
    } else if (probe === 'invalid-format') {
      mutant.fixture.candidate_output.format = 'slidez';
      delete group.slide_projection;
    } else if (probe === 'missing-maturity') {
      delete firstResult.result_maturity;
    } else if (probe === 'missing-implementation-narrative') {
      delete firstResult.implementation_narrative;
    } else if (probe === 'hollow-implementation-narrative') {
      firstResult.implementation_narrative.branch_and_fallback = '';
    } else if (probe === 'node-list-implementation-narrative') {
      firstResult.implementation_narrative = {
        normal_path: firstResult.solution_logic.main_flow.join(' -> '),
        branch_and_fallback: firstResult.solution_logic.branches.join(' -> '),
        outcome_and_invariant: firstResult.solution_logic.invariants.join(' -> '),
      };
    } else if (probe === 'prefixed-node-list-implementation-narrative') {
      firstResult.implementation_narrative = {
        normal_path: `Normal path: ${firstResult.solution_logic.main_flow.join(' -> ')}`,
        branch_and_fallback: `Branch and fallback: ${firstResult.solution_logic.branches.join(' -> ')} -> ${firstResult.solution_logic.fallbacks.join(' -> ')}`,
        outcome_and_invariant: `Outcome and invariant: ${firstResult.solution_logic.output} -> ${firstResult.solution_logic.invariants.join(' -> ')}`,
      };
    } else if (probe === 'composite-node-list-implementation-narrative') {
      firstResult.implementation_narrative = {
        normal_path: [firstResult.solution_logic.trigger, ...firstResult.solution_logic.main_flow].join(' -> '),
        branch_and_fallback: [...firstResult.solution_logic.branches, ...firstResult.solution_logic.fallbacks].reverse().join(' -> '),
        outcome_and_invariant: [firstResult.solution_logic.output, ...firstResult.solution_logic.invariants].join(' -> '),
      };
    } else if (probe === 'invisible-implementation-narrative') {
      firstResult.implementation_narrative = {
        normal_path: '\u200B',
        branch_and_fallback: '\u200B\u200B',
        outcome_and_invariant: '\u200B\u200B\u200B',
      };
    } else if (probe === 'duplicate-implementation-narrative') {
      const duplicate = 'The mechanism follows one supported path and preserves one supported constraint.';
      firstResult.implementation_narrative = {
        normal_path: duplicate,
        branch_and_fallback: duplicate,
        outcome_and_invariant: duplicate,
      };
    } else if (probe === 'confidential-implementation-narrative') {
      firstResult.implementation_narrative.normal_path = 'Read C:\\Users\\alice\\SecretProject\\design.md and then call https://internal.example/incident/123.';
    } else if (probe === 'supporting-logic-in-main-deck') {
      firstResult.solution_logic.significance = 'supporting';
      delete firstResult.implementation_narrative;
      projection.core_result_ids = projection.core_result_ids.filter((id) => id !== firstResult.id);
    } else if (probe === 'duplicate-slide-titles') {
      projection.main_deck_slide_titles = projection.main_deck_slide_titles.map(() => 'Weekly update');
    } else if (probe === 'unsafe-main-deck-markup') {
      projection.main_deck_slide_titles[0] = '![track](//attacker.invalid/pixel)';
    } else if (probe === 'oversized-implementation-narrative') {
      firstResult.implementation_narrative.normal_path = `When the supported path starts, ${'safe context '.repeat(60)}the supported actions complete.`;
    } else if (probe === 'oversized-solution-logic') {
      firstResult.solution_logic.actors = Array.from({ length: LOGIC_LIST_LIMITS.actors + 1 }, (_, index) => `actor ${index}`);
    } else if (probe === 'decorative-maintenance-narrative') {
      firstResult.implementation_narrative = {
        normal_path: 'Shared helpers replace duplicated maintenance code before the existing tests run.',
        branch_and_fallback: 'If packaging fails, the maintenance change remains pending.',
        outcome_and_invariant: 'The code surface is smaller while runtime behavior remains unchanged.',
      };
    } else {
      throw new Error(`${fixture.id}: unknown rejection probe ${probe}`);
    }

    assert.throws(
      () => validateReportContract(mutant),
      `${fixture.id}: rejection probe ${probe} unexpectedly passed`,
    );
  }
}
