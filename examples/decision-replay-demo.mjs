#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const decisionGraph = path.join(repoRoot, 'skills', 'query', 'scripts', 'decision_graph.py');
const vault = path.join(scriptDir, 'vault');
const slug = 'storyboard-pipeline';
const query = 'why validation repair ownership';

function fail(message) {
  console.error(`decision replay demo failed: ${message}`);
  process.exit(1);
}

function requireArray(value, name) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`expected non-empty ${name}`);
  }
  return value;
}

const result = spawnSync('python3', [
  decisionGraph,
  'query',
  query,
  '--vault',
  vault,
  '--slug',
  slug,
  '--cwd',
  repoRoot,
  '--mode',
  'why',
  '--limit',
  '3',
], {
  cwd: repoRoot,
  encoding: 'utf-8',
});

if (result.status !== 0) {
  fail([
    `helper exited with status ${result.status}`,
    result.stdout.trim(),
    result.stderr.trim(),
  ].filter(Boolean).join('\n'));
}

let pack;
try {
  pack = JSON.parse(result.stdout);
} catch (error) {
  fail(`helper did not return JSON: ${error instanceof Error ? error.message : String(error)}`);
}

if (pack.schema_version !== 'lode.decision_query.v1') {
  fail(`unexpected query schema: ${pack.schema_version}`);
}
if (pack.answerable !== true) {
  fail(`expected answerable=true, got ${pack.answerable}`);
}
if (pack.evidence_strength !== 'strong') {
  fail(`expected strong evidence, got ${pack.evidence_strength}`);
}

const topNode = requireArray(pack.top_nodes, 'top_nodes')[0];
if (topNode.id !== 'storyboard-pipeline:2026-W19:003') {
  fail(`expected validation ownership decision first, got ${topNode.id}`);
}
requireArray(topNode.source_entry_refs, 'source_entry_refs');

const rejectedAlternatives = requireArray(pack.rejected_alternatives, 'rejected_alternatives');
if (!rejectedAlternatives.some(item => String(item.option || '').includes('Orchestration-level repair ownership'))) {
  fail('expected rejected orchestration-level repair ownership alternative');
}

const summary = {
  schema_version: pack.schema_version,
  project_slug: pack.project_slug,
  query: pack.query,
  answerable: pack.answerable,
  evidence_strength: pack.evidence_strength,
  answerability_reason: pack.answerability_reason,
  top_decision_id: topNode.id,
  top_decision: topNode.decision,
  matched_terms: pack.matched_terms,
  source_entry_refs: topNode.source_entry_refs,
  rejected_alternatives: rejectedAlternatives,
};

console.log(JSON.stringify(summary, null, 2));
