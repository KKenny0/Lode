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
const DIRECT_VALIDATION_KINDS = new Set(['test', 'smoke_test', 'benchmark', 'observed', 'recorded']);
const SERIES_CHART_TYPES = new Set(['distribution_chart', 'trend_chart', 'timeline_chart', 'waterfall_chart']);

function present(value) {
  return typeof value === 'string' ? Boolean(value.trim()) : value !== null && value !== undefined;
}

function nonEmptyString(value) {
  return typeof value === 'string' && Boolean(value.trim());
}

function nonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(nonEmptyString);
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
    const hasMetricEvidence = validateMetricEvidence(result, fixtureId);
    validateMaturity(result, fixtureId);
    const hasTransition = validateStateTransition(result, fixtureId);
    const hasLogic = validateSolutionLogic(result, fixtureId, expectedRoutes);
    const hasDirectValidation = nonEmptyString(result.validation_result)
      && DIRECT_VALIDATION_KINDS.has(result.effect_evidence_kind);
    const triadCoverage = [hasTransition, hasLogic, hasMetricEvidence || hasDirectValidation].filter(Boolean).length;
    assert(triadCoverage >= 2, `${fixtureId}: ${result.id} covers fewer than two presentation-contract parts`);
    if (result.solution_logic?.significance === 'core') {
      assert(triadCoverage === 3, `${fixtureId}: ${result.id} core solution must cover all three presentation-contract parts`);
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
    assert(headlines.length >= 1 && headlines.length <= 4, `${fixture.id}: headline count must be 1-4 per group`);
    const portfolio = Array.isArray(group.portfolio) ? group.portfolio : [];
    const covered = new Set([...headlines, ...portfolio]);
    for (const stream of group.all_streams || []) {
      assert(covered.has(stream), `${fixture.id}: uncovered stream ${stream}`);
    }

    const targets = Array.isArray(group.next_closure_targets) ? group.next_closure_targets : [];
    assert(targets.length >= 2 && targets.length <= 4, `${fixture.id}: closure target count must be 2-4 per group`);

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
    } else {
      throw new Error(`${fixture.id}: unknown rejection probe ${probe}`);
    }

    assert.throws(
      () => validateReportContract(mutant),
      `${fixture.id}: rejection probe ${probe} unexpectedly passed`,
    );
  }
}
