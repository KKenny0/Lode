#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(cliRoot, '..');
const sourceSkillsDir = path.join(repoRoot, 'skills');
const bundledSkillsDir = path.join(cliRoot, 'skills');
const canonicalConvention = path.join(repoRoot, 'references', 'weekly-ppt-convention.md');

const officialSkills = [
  'capture',
  'recall',
  'query',
  'daily',
  'weekly',
  'monthly',
  'roadmap',
  'cold-start-interview',
];

const conventionCopies = [
  path.join(sourceSkillsDir, 'capture', 'references', 'weekly-ppt-convention.md'),
  path.join(sourceSkillsDir, 'recall', 'references', 'weekly-ppt-convention.md'),
  path.join(sourceSkillsDir, 'roadmap', 'references', 'weekly-ppt-convention.md'),
  path.join(sourceSkillsDir, 'monthly', 'references', 'weekly-ppt-convention.md'),
  path.join(bundledSkillsDir, 'capture', 'references', 'weekly-ppt-convention.md'),
  path.join(bundledSkillsDir, 'recall', 'references', 'weekly-ppt-convention.md'),
  path.join(bundledSkillsDir, 'roadmap', 'references', 'weekly-ppt-convention.md'),
  path.join(bundledSkillsDir, 'monthly', 'references', 'weekly-ppt-convention.md'),
];

const syncedScriptPairs = [
  [
    path.join(sourceSkillsDir, 'roadmap', 'scripts', 'decision_graph.py'),
    path.join(sourceSkillsDir, 'query', 'scripts', 'decision_graph.py'),
  ],
  [
    path.join(bundledSkillsDir, 'roadmap', 'scripts', 'decision_graph.py'),
    path.join(bundledSkillsDir, 'query', 'scripts', 'decision_graph.py'),
  ],
];

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function walk(dir, predicate, matches = []) {
  if (!fs.existsSync(dir)) return matches;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (predicate(fullPath, entry)) matches.push(fullPath);
    if (entry.isDirectory()) walk(fullPath, predicate, matches);
  }
  return matches;
}

function parseSkillFrontmatter(skillPath) {
  const skillFile = path.join(skillPath, 'SKILL.md');
  const raw = fs.readFileSync(skillFile, 'utf-8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert(Boolean(match), `${skillFile} is missing YAML frontmatter`);
  if (!match) return null;
  return yaml.load(match[1]);
}

function validateSkillDirectory(baseDir, skill) {
  const skillPath = path.join(baseDir, skill);
  assert(exists(skillPath), `${skillPath} is missing`);
  assert(exists(path.join(skillPath, 'SKILL.md')), `${skill}/SKILL.md is missing`);
  assert(exists(path.join(skillPath, 'agents', 'openai.yaml')), `${skill}/agents/openai.yaml is missing`);
  if (!exists(path.join(skillPath, 'SKILL.md'))) return;

  const frontmatter = parseSkillFrontmatter(skillPath);
  if (frontmatter) {
    assert(frontmatter.name === skill, `${skill} frontmatter name must be ${skill}`);
    assert(typeof frontmatter.description === 'string' && frontmatter.description.trim().length > 0, `${skill} description is required`);
    const keys = Object.keys(frontmatter);
    const allowed = new Set(['name', 'description']);
    for (const key of keys) {
      assert(allowed.has(key), `${skill} frontmatter has unsupported key: ${key}`);
    }
  }
}

assert(exists(bundledSkillsDir), 'cli/skills is missing. Run npm run copy-skills first.');

for (const skill of officialSkills) {
  validateSkillDirectory(sourceSkillsDir, skill);
  validateSkillDirectory(bundledSkillsDir, skill);
}

const bundledNames = fs.existsSync(bundledSkillsDir)
  ? fs.readdirSync(bundledSkillsDir).filter(name => fs.statSync(path.join(bundledSkillsDir, name)).isDirectory())
  : [];
for (const name of bundledNames) {
  assert(officialSkills.includes(name), `Unexpected bundled skill directory: ${name}`);
}

const forbiddenBundled = walk(bundledSkillsDir, (fullPath, entry) => (
  entry.isDirectory() && (entry.name === 'evals' || entry.name.endsWith('-workspace'))
));
for (const dir of forbiddenBundled) {
  errors.push(`Forbidden bundled directory: ${path.relative(cliRoot, dir)}`);
}

const canonical = exists(canonicalConvention) ? fs.readFileSync(canonicalConvention, 'utf-8') : null;
assert(Boolean(canonical), 'Canonical weekly-ppt-convention.md is missing');
if (canonical) {
  for (const copy of conventionCopies) {
    assert(exists(copy), `Convention copy is missing: ${copy}`);
    if (exists(copy)) {
      const content = fs.readFileSync(copy, 'utf-8');
      assert(content === canonical, `Convention copy is stale: ${copy}`);
    }
  }
}

for (const [source, copy] of syncedScriptPairs) {
  assert(exists(source), `Script source is missing: ${source}`);
  assert(exists(copy), `Script copy is missing: ${copy}`);
  if (exists(source) && exists(copy)) {
    const sourceContent = fs.readFileSync(source, 'utf-8');
    const copyContent = fs.readFileSync(copy, 'utf-8');
    assert(sourceContent === copyContent, `Script copy is stale: ${copy}`);
  }
}

if (errors.length > 0) {
  console.error('Skill checks failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Skill checks passed for ${officialSkills.length} skills.`);
