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
  'lode-session-recap',
  'lode-arch-doc',
  'lode-git-daily-note',
  'lode-weekly-outline',
  'lode-monthly-review',
];

const conventionCopies = [
  path.join(sourceSkillsDir, 'lode-session-recap', 'references', 'weekly-ppt-convention.md'),
  path.join(sourceSkillsDir, 'lode-arch-doc', 'references', 'weekly-ppt-convention.md'),
  path.join(sourceSkillsDir, 'lode-monthly-review', 'references', 'weekly-ppt-convention.md'),
  path.join(bundledSkillsDir, 'lode-session-recap', 'references', 'weekly-ppt-convention.md'),
  path.join(bundledSkillsDir, 'lode-arch-doc', 'references', 'weekly-ppt-convention.md'),
  path.join(bundledSkillsDir, 'lode-monthly-review', 'references', 'weekly-ppt-convention.md'),
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
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
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

if (errors.length > 0) {
  console.error('Skill checks failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Skill checks passed for ${officialSkills.length} skills.`);
