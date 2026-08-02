import assert from 'node:assert/strict';

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

function normalizeSemanticValue(value) {
  if (typeof value === 'string') {
    return value.replace(/\r\n?/g, '\n').trim().replace(/\s+/g, ' ');
  }
  if (Array.isArray(value)) return value.map(normalizeSemanticValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeSemanticValue(item)]),
    );
  }
  return value;
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

const FORBIDDEN_DECK_FIELDS = [
  'audience takeaway',
  'recommended visual form',
  'page composition',
  'on-slide copy',
  'production constraints',
  'source grounding packet',
  'intended_takeaway',
  'supported_claim',
  'design_rationale',
  'problem_reframe',
  '"stories"',
  '"why"',
  '"goal"',
];

const FORBIDDEN_ROLE_TITLES = new Set([
  'background',
  'context',
  'design rationale',
  'implementation',
  'mechanism',
  'validation',
  '背景',
  '设计判断',
  '实现机制',
  '验证结果',
]);

function validatePptReadyMarkdownOutput(fixture, output) {
  const audience = output.audience_contract || {};
  for (const field of [
    'primary_audience',
    'prior_knowledge',
    'occasion',
    'deck_job',
    'audience_outcome',
    'central_claim',
    'confidence_boundary',
  ]) {
    assert(nonEmptyString(audience[field]), `${fixture.id}: audience contract ${field} is missing`);
  }
  assert(nonEmptyString(output.deck_context), `${fixture.id}: deck context is missing`);
  assert(nonEmptyString(output.management_question), `${fixture.id}: management question is missing`);
  assert(nonEmptyString(output.thesis), `${fixture.id}: deck thesis is missing`);
  const slides = Array.isArray(output.slides) ? output.slides : [];
  assert(slides.length > 0 && slides.length <= 8, `${fixture.id}: main deck must contain 1-8 necessary slides`);
  if (Number.isInteger(fixture.fixture?.expected_slide_count)) {
    assert.equal(slides.length, fixture.fixture.expected_slide_count, `${fixture.id}: deck has the wrong merge/split result`);
  }

  const publicText = JSON.stringify(output).toLowerCase();
  for (const field of FORBIDDEN_DECK_FIELDS) {
    assert(!publicText.includes(field), `${fixture.id}: public deck leaks ${field}`);
  }

  const slideIds = new Set();
  for (const [slideIndex, slide] of slides.entries()) {
    const slideLabel = `${fixture.id}: slide ${slideIndex + 1}`;
    assert(nonEmptyString(slide.id), `${slideLabel} stable id is missing`);
    assert(!slideIds.has(slide.id), `${slideLabel} duplicates slide id ${slide.id}`);
    slideIds.add(slide.id);
    assert(nonEmptyString(slide.title), `${slideLabel} title is missing`);
    assert(nonEmptyString(slide.content), `${slideLabel} presentation content is missing`);
    assert(!/[?？]\s*$/.test(slide.title), `${slideLabel} uses a question instead of a supported claim`);
    assert(
      !FORBIDDEN_ROLE_TITLES.has(normalizeNarrativeText(slide.title)),
      `${slideLabel} title exposes an internal role`,
    );
    assert(!containsForbiddenMainDeckReference(slide.title), `${slideLabel} title contains an unsafe reference`);
    assert(
      !slide.content.replaceAll('\\n', '\n').split('\n').some((line) => containsForbiddenMainDeckReference(line)),
      `${slideLabel} content contains an unsafe reference`,
    );
    assert(
      !/(place on the left|use a .*diagram|font|color|layout|card grid|制作|版式|字体|颜色)/i.test(slide.content),
      `${slideLabel} contains production guidance`,
    );
    for (const term of fixture.fixture?.required_title_terms?.[slideIndex] || []) {
      assert(slide.title.toLowerCase().includes(term.toLowerCase()), `${slideLabel} title is missing claim term ${term}`);
    }
    for (const term of fixture.fixture?.required_content_terms?.[slideIndex] || []) {
      assert(slide.content.toLowerCase().includes(term.toLowerCase()), `${slideLabel} is missing grounded content term ${term}`);
    }
    const content = slide.content.replaceAll('\\n', '\n');
    const diagramIndex = content.search(/```(?:mermaid|text)\b/i);
    if (diagramIndex >= 0) {
      const introduction = content.slice(0, diagramIndex).trim();
      assert(nonEmptyString(introduction), `${slideLabel} must explain the concept before its diagram`);
      for (const term of fixture.fixture?.required_pre_diagram_terms?.[slideIndex] || []) {
        assert(
          introduction.toLowerCase().includes(String(term).toLowerCase()),
          `${slideLabel} diagram introduction is missing concept term ${term}`,
        );
      }
    }
    const mainText = `${slide.title}\n${slide.content}`.toLowerCase();
    for (const term of fixture.fixture?.forbidden_main_terms || []) {
      assert(!mainText.includes(String(term).toLowerCase()), `${slideLabel} leaked audience-inappropriate term ${term}`);
    }
  }

  const appendix = Array.isArray(output.evidence_appendix) ? output.evidence_appendix : [];
  assert(appendix.length > 0, `${fixture.id}: compact evidence appendix is missing`);
  for (const item of appendix) {
    assert(nonEmptyString(item.claim), `${fixture.id}: appendix claim is missing`);
    assert(nonEmptyString(item.source), `${fixture.id}: appendix source is missing`);
    assert(nonEmptyString(item.boundary), `${fixture.id}: appendix boundary is missing`);
  }
  const appendixText = appendix.map(item => `${item.source}\n${item.boundary}`).join('\n').toLowerCase();
  for (const term of fixture.fixture?.required_appendix_source_terms || []) {
    assert(
      appendixText.includes(String(term).toLowerCase()),
      `${fixture.id}: evidence appendix is missing source-chain term ${term}`,
    );
  }

  for (const unique of fixture.fixture?.unique_content_terms || []) {
    const owners = slides.filter((slide) => slide.content.toLowerCase().includes(unique.toLowerCase()));
    assert.equal(owners.length, 1, `${fixture.id}: content unit ${unique} is missing or does not justify one page`);
  }
}

function validatePptRevisionRoundTrip(fixture, outputs) {
  const expectation = fixture.fixture?.revision_expectation;
  if (!expectation) return;
  assert.equal(outputs.length, 2, `${fixture.id}: revision benchmark requires baseline and revised outputs`);
  const [baseline, revised] = outputs;
  assert(nonEmptyString(baseline.version), `${fixture.id}: baseline version is missing`);
  assert(nonEmptyString(revised.version), `${fixture.id}: revised version is missing`);
  assert.notEqual(revised.version, baseline.version, `${fixture.id}: revision overwrote the baseline version`);
  assert.equal(revised.previous_version, baseline.version, `${fixture.id}: revised output does not point to its predecessor`);
  assert(Date.parse(revised.as_of) > Date.parse(baseline.as_of), `${fixture.id}: revision cutoff did not advance`);

  const baselineById = new Map(baseline.slides.map((slide) => [slide.id, slide]));
  const revisedById = new Map(revised.slides.map((slide) => [slide.id, slide]));
  const actualAdded = [...revisedById.keys()].filter(id => !baselineById.has(id)).sort();
  const actualRemoved = [...baselineById.keys()].filter(id => !revisedById.has(id)).sort();
  assert.deepEqual(actualAdded, [...(expectation.added_slide_ids || [])].sort(), `${fixture.id}: revision added unexpected slides`);
  assert.deepEqual(actualRemoved, [...(expectation.removed_slide_ids || [])].sort(), `${fixture.id}: revision removed unexpected slides`);
  if (expectation.expected_slide_order) {
    assert.deepEqual([...revisedById.keys()], expectation.expected_slide_order, `${fixture.id}: revised slide order is wrong`);
  }
  const changedSlideIds = expectation.changed_slide_ids || [];
  const unchangedSlideIds = expectation.unchanged_slide_ids || [];
  assert.equal(new Set(changedSlideIds).size, changedSlideIds.length, `${fixture.id}: changed slide classification contains duplicates`);
  assert.equal(new Set(unchangedSlideIds).size, unchangedSlideIds.length, `${fixture.id}: unchanged slide classification contains duplicates`);
  const classifiedSlideIds = [...changedSlideIds, ...unchangedSlideIds];
  assert.equal(new Set(classifiedSlideIds).size, classifiedSlideIds.length, `${fixture.id}: a slide is classified as both changed and unchanged`);
  const commonSlideIds = [...baselineById.keys()].filter(id => revisedById.has(id)).sort();
  assert.deepEqual([...classifiedSlideIds].sort(), commonSlideIds, `${fixture.id}: every slide shared by both versions must be classified exactly once`);

  for (const slideId of changedSlideIds) {
    assert(baselineById.has(slideId) && revisedById.has(slideId), `${fixture.id}: changed slide ${slideId} must exist in both versions`);
    assert.notDeepEqual(
      normalizeSemanticValue(revisedById.get(slideId)),
      normalizeSemanticValue(baselineById.get(slideId)),
      `${fixture.id}: affected slide ${slideId} was not substantively revised`,
    );
  }
  for (const slideId of unchangedSlideIds) {
    assert(baselineById.has(slideId) && revisedById.has(slideId), `${fixture.id}: unchanged slide ${slideId} must exist in both versions`);
    assert.deepEqual(
      normalizeSemanticValue(revisedById.get(slideId)),
      normalizeSemanticValue(baselineById.get(slideId)),
      `${fixture.id}: unrelated slide ${slideId} changed`,
    );
  }
  for (const [slideId, terms] of Object.entries(expectation.required_revised_terms || {})) {
    const slide = revisedById.get(slideId);
    assert(slide, `${fixture.id}: revised slide ${slideId} is missing`);
    const text = `${slide.title}\n${slide.content}`.toLowerCase();
    for (const term of terms) {
      assert(text.includes(String(term).toLowerCase()), `${fixture.id}: revised slide ${slideId} is missing ${term}`);
    }
  }
  for (const [slideId, terms] of Object.entries(expectation.forbidden_revised_terms || {})) {
    const slide = revisedById.get(slideId);
    assert(slide, `${fixture.id}: revised slide ${slideId} is missing`);
    const text = `${slide.title}\n${slide.content}`.toLowerCase();
    for (const term of terms) {
      assert(!text.includes(String(term).toLowerCase()), `${fixture.id}: revised slide ${slideId} retained ${term}`);
    }
  }
}

function validatePptRevisionRejectionProbes(fixture, outputs) {
  const expectation = fixture.fixture?.revision_expectation;
  if (!expectation) return;
  for (const probe of fixture.fixture?.revision_rejection_probes || []) {
    const mutantFixture = structuredClone(fixture);
    const mutantOutputs = structuredClone(outputs);
    const mutantExpectation = mutantFixture.fixture.revision_expectation;
    const [baseline, revised] = mutantOutputs;
    const baselineById = new Map(baseline.slides.map(slide => [slide.id, slide]));

    if (probe === 'whitespace-only') {
      revised.slides = revised.slides.map((slide) => {
        if (!(mutantExpectation.changed_slide_ids || []).includes(slide.id)) return slide;
        const original = structuredClone(baselineById.get(slide.id));
        original.content = `  ${original.content.replaceAll('\n', '  \n')}  `;
        return original;
      });
    } else if (probe === 'unclassified-common-slide') {
      mutantExpectation.changed_slide_ids = mutantExpectation.changed_slide_ids.slice(1);
    } else if (probe === 'duplicate-classification') {
      const slideId = mutantExpectation.changed_slide_ids[0] || mutantExpectation.unchanged_slide_ids[0];
      mutantExpectation.unchanged_slide_ids.push(slideId);
    } else if (probe === 'nonexistent-classification') {
      mutantExpectation.changed_slide_ids.push('missing-slide');
    } else {
      throw new Error(`${fixture.id}: unknown revision rejection probe ${probe}`);
    }

    assert.throws(
      () => validatePptRevisionRoundTrip(mutantFixture, mutantOutputs),
      `${fixture.id}: revision rejection probe ${probe} unexpectedly passed`,
    );
  }
}

export function validateWeeklyPptReadyMarkdownContract(fixture) {
  const outputs = fixture.fixture?.candidate_outputs || [fixture.fixture?.candidate_output || {}];
  for (const output of outputs) validatePptReadyMarkdownOutput(fixture, output);
  validatePptRevisionRoundTrip(fixture, outputs);
  validatePptRevisionRejectionProbes(fixture, outputs);
}

export function validateWeeklyPptReadyMarkdownRejectionProbes(fixture) {
  for (const probe of fixture.fixture?.rejection_probes || []) {
    const mutant = structuredClone(fixture);
    mutant.id = `${fixture.id}:${probe}`;
    const output = mutant.fixture.candidate_output || mutant.fixture.candidate_outputs[0];
    const slides = output.slides;

    if (probe === 'missing-audience') {
      output.audience_contract.primary_audience = '';
    } else if (probe === 'missing-outcome') {
      output.audience_contract.audience_outcome = '';
    } else if (probe === 'missing-thesis') {
      output.thesis = '';
    } else if (probe === 'missing-content') {
      slides[0].content = '';
    } else if (probe === 'empty-deck') {
      output.slides = [];
    } else if (probe === 'diagram-first') {
      const content = slides[0].content.replaceAll('\\n', '\n');
      const diagramIndex = content.search(/```(?:mermaid|text)\b/i);
      slides[0].content = content.slice(diagramIndex);
    } else if (probe === 'production-guideline') {
      slides[0].content += '\n\n### Page composition\nPlace nodes on the left using blue cards.';
    } else if (probe === 'topic-title') {
      slides[0].title = 'Provider comparison';
    } else if (probe === 'question-title') {
      slides[0].title = 'Which provider should we choose?';
    } else if (probe === 'claim-proof-gap') {
      slides[0].content = 'Implementation work was completed during the week.';
    } else if (probe === 'role-title') {
      slides[0].title = '设计判断';
    } else if (probe === 'unsafe-main-deck-reference') {
      slides[0].content += '\n/Users/example/private/design.md';
    } else if (probe === 'complex-result-merged') {
      slides[0].content += `\n${slides[1].content}`;
      slides.splice(1);
    } else if (probe === 'simple-result-split') {
      const original = slides[0];
      slides.splice(
        0,
        1,
        {...original, id: `${original.id}-before`, title: 'The previous handoff had two owners'},
        {...original, id: `${original.id}-after`, title: 'The new handoff has one owner'},
      );
    } else {
      throw new Error(`${fixture.id}: unknown PPT-ready Markdown rejection probe ${probe}`);
    }

    assert.throws(
      () => validatePptReadyMarkdownOutput(mutant, output),
      `${fixture.id}: PPT-ready Markdown rejection probe ${probe} unexpectedly passed`,
    );
  }
}
