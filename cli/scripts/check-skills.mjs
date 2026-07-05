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
const codexPluginBundleDir = path.join(repoRoot, 'plugins', 'tracework');
const codexPluginSkillsDir = path.join(codexPluginBundleDir, 'skills');
const codexPluginManifest = path.join(codexPluginBundleDir, '.codex-plugin', 'plugin.json');
const claudePluginManifest = path.join(codexPluginBundleDir, '.claude-plugin', 'plugin.json');
const sourceCodexPluginManifest = path.join(repoRoot, '.codex-plugin', 'plugin.json');
const sourceClaudePluginManifest = path.join(repoRoot, '.claude-plugin', 'plugin.json');
const claudeMarketplace = path.join(repoRoot, '.claude-plugin', 'marketplace.json');
const codexMarketplace = path.join(repoRoot, '.agents', 'plugins', 'marketplace.json');
const pluginPathsSource = path.join(repoRoot, 'cli', 'src', 'plugin-paths.ts');
const canonicalConvention = path.join(repoRoot, 'references', 'tracework-storage-convention.md');
const canonicalDecisionReplay = path.join(repoRoot, 'references', 'decision_replay.py');

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
  path.join(sourceSkillsDir, 'capture', 'references', 'tracework-storage-convention.md'),
  path.join(sourceSkillsDir, 'recall', 'references', 'tracework-storage-convention.md'),
  path.join(sourceSkillsDir, 'roadmap', 'references', 'tracework-storage-convention.md'),
  path.join(sourceSkillsDir, 'monthly', 'references', 'tracework-storage-convention.md'),
  path.join(bundledSkillsDir, 'capture', 'references', 'tracework-storage-convention.md'),
  path.join(bundledSkillsDir, 'recall', 'references', 'tracework-storage-convention.md'),
  path.join(bundledSkillsDir, 'roadmap', 'references', 'tracework-storage-convention.md'),
  path.join(bundledSkillsDir, 'monthly', 'references', 'tracework-storage-convention.md'),
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

const decisionReplayCopies = [
  path.join(sourceSkillsDir, 'query', 'scripts', 'decision_replay.py'),
  path.join(sourceSkillsDir, 'roadmap', 'scripts', 'decision_replay.py'),
  path.join(sourceSkillsDir, 'recall', 'scripts', 'decision_replay.py'),
  path.join(bundledSkillsDir, 'query', 'scripts', 'decision_replay.py'),
  path.join(bundledSkillsDir, 'roadmap', 'scripts', 'decision_replay.py'),
  path.join(bundledSkillsDir, 'recall', 'scripts', 'decision_replay.py'),
];

const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function isSemver(version) {
  return typeof version === 'string' && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(version);
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
assert(exists(codexPluginBundleDir), 'plugins/tracework is missing. Run npm run copy-skills first.');
assert(exists(codexPluginManifest), 'plugins/tracework/.codex-plugin/plugin.json is missing. Run npm run copy-skills first.');
assert(exists(claudePluginManifest), 'plugins/tracework/.claude-plugin/plugin.json is missing. Run npm run copy-skills first.');
assert(exists(sourceCodexPluginManifest), '.codex-plugin/plugin.json is missing');
assert(exists(sourceClaudePluginManifest), '.claude-plugin/plugin.json is missing');

const allowedPluginBundleEntries = new Set(['.codex-plugin', '.claude-plugin', 'skills', 'assets']);
if (exists(codexPluginBundleDir)) {
  for (const entry of fs.readdirSync(codexPluginBundleDir)) {
    assert(allowedPluginBundleEntries.has(entry), `Unexpected plugin bundle entry: plugins/tracework/${entry}`);
  }
}

for (const skill of officialSkills) {
  validateSkillDirectory(sourceSkillsDir, skill);
  validateSkillDirectory(bundledSkillsDir, skill);
  validateSkillDirectory(codexPluginSkillsDir, skill);
}

const bundledNames = fs.existsSync(bundledSkillsDir)
  ? fs.readdirSync(bundledSkillsDir).filter(name => fs.statSync(path.join(bundledSkillsDir, name)).isDirectory())
  : [];
for (const name of bundledNames) {
  assert(officialSkills.includes(name), `Unexpected bundled skill directory: ${name}`);
}

const codexPluginNames = fs.existsSync(codexPluginSkillsDir)
  ? fs.readdirSync(codexPluginSkillsDir).filter(name => fs.statSync(path.join(codexPluginSkillsDir, name)).isDirectory())
  : [];
for (const name of codexPluginNames) {
  assert(officialSkills.includes(name), `Unexpected Codex plugin skill directory: ${name}`);
}

const forbiddenBundled = walk(bundledSkillsDir, (fullPath, entry) => (
  entry.isDirectory() && (entry.name === 'evals' || entry.name.endsWith('-workspace'))
));
for (const dir of forbiddenBundled) {
  errors.push(`Forbidden bundled directory: ${path.relative(cliRoot, dir)}`);
}

const forbiddenCodexPlugin = walk(codexPluginSkillsDir, (fullPath, entry) => (
  entry.isDirectory() && (entry.name === 'evals' || entry.name.endsWith('-workspace'))
));
for (const dir of forbiddenCodexPlugin) {
  errors.push(`Forbidden Codex plugin directory: ${path.relative(repoRoot, dir)}`);
}

if (exists(sourceCodexPluginManifest) && exists(codexPluginManifest)) {
  const sourceManifest = fs.readFileSync(sourceCodexPluginManifest, 'utf-8');
  const bundleManifest = fs.readFileSync(codexPluginManifest, 'utf-8');
  assert(bundleManifest === sourceManifest, 'Codex plugin manifest copy is stale: plugins/tracework/.codex-plugin/plugin.json');
}

if (exists(sourceClaudePluginManifest) && exists(claudePluginManifest)) {
  const sourceManifest = fs.readFileSync(sourceClaudePluginManifest, 'utf-8');
  const bundleManifest = fs.readFileSync(claudePluginManifest, 'utf-8');
  assert(bundleManifest === sourceManifest, 'Claude plugin manifest copy is stale: plugins/tracework/.claude-plugin/plugin.json');
}

if (exists(sourceCodexPluginManifest)) {
  const manifest = readJson(sourceCodexPluginManifest);
  assert(!('$schema' in manifest), '.codex-plugin/plugin.json must not include $schema; Codex plugin validation rejects it');
  assert(manifest.name === 'tracework', '.codex-plugin/plugin.json name must be tracework');
  assert(isSemver(manifest.version), '.codex-plugin/plugin.json version must be valid semver');
  assert(manifest.skills === './skills/', '.codex-plugin/plugin.json skills must point to ./skills/');
}

if (exists(codexMarketplace)) {
  const marketplace = readJson(codexMarketplace);
  assert(marketplace.name === 'tracework', '.agents/plugins/marketplace.json name must be tracework');
  assert(Array.isArray(marketplace.plugins) && marketplace.plugins.length === 1, '.agents/plugins/marketplace.json must expose exactly one plugin');
  const plugin = marketplace.plugins?.[0];
  assert(plugin?.name === 'tracework', '.agents/plugins/marketplace.json plugin name must be tracework');
  assert(plugin?.source?.source === 'local', '.agents/plugins/marketplace.json plugin source must be local');
  assert(plugin?.source?.path === './plugins/tracework', '.agents/plugins/marketplace.json plugin source path must be ./plugins/tracework');
  assert(!('interface' in plugin), '.agents/plugins/marketplace.json plugin entry should not carry non-standard interface metadata');
}

if (exists(sourceClaudePluginManifest)) {
  const manifest = readJson(sourceClaudePluginManifest);
  assert(manifest.name === 'tracework', '.claude-plugin/plugin.json name must be tracework');
  assert(isSemver(manifest.version), '.claude-plugin/plugin.json version must be valid semver');
}

if (exists(claudeMarketplace)) {
  const marketplace = readJson(claudeMarketplace);
  assert(marketplace.name === 'tracework', '.claude-plugin/marketplace.json name must be tracework');
  assert(Array.isArray(marketplace.plugins) && marketplace.plugins.length === 1, '.claude-plugin/marketplace.json must expose exactly one plugin');
  const plugin = marketplace.plugins?.[0];
  assert(plugin?.name === 'tracework', '.claude-plugin/marketplace.json plugin name must be tracework');
  assert(isSemver(plugin?.version), '.claude-plugin/marketplace.json plugin version must be valid semver');
  assert(plugin?.source === './plugins/tracework', '.claude-plugin/marketplace.json plugin source must be ./plugins/tracework');
}

if (exists(sourceCodexPluginManifest) && exists(sourceClaudePluginManifest) && exists(claudeMarketplace)) {
  const codexVersion = readJson(sourceCodexPluginManifest).version;
  const claudeVersion = readJson(sourceClaudePluginManifest).version;
  const claudeMarketplaceVersion = readJson(claudeMarketplace).plugins?.[0]?.version;
  const pluginPathsContent = exists(pluginPathsSource) ? fs.readFileSync(pluginPathsSource, 'utf-8') : '';
  const pluginPathsVersion = pluginPathsContent.match(/PLUGIN_VERSION\s*=\s*'([^']+)'/)?.[1];
  assert(
    codexVersion === claudeVersion && claudeVersion === claudeMarketplaceVersion,
    `Plugin versions must match across Codex, Claude, and Claude marketplace manifests: ${codexVersion}, ${claudeVersion}, ${claudeMarketplaceVersion}`,
  );
  assert(pluginPathsVersion === codexVersion, `cli/src/plugin-paths.ts PLUGIN_VERSION must match plugin manifests: ${pluginPathsVersion}, ${codexVersion}`);
}

const canonical = exists(canonicalConvention) ? fs.readFileSync(canonicalConvention, 'utf-8') : null;
assert(Boolean(canonical), 'Canonical tracework-storage-convention.md is missing');
if (canonical) {
  for (const copy of conventionCopies) {
    assert(exists(copy), `Convention copy is missing: ${copy}`);
    if (exists(copy)) {
      const content = fs.readFileSync(copy, 'utf-8');
      assert(content === canonical, `Convention copy is stale: ${copy}`);
    }
  }
}

const decisionReplay = exists(canonicalDecisionReplay) ? fs.readFileSync(canonicalDecisionReplay, 'utf-8') : null;
assert(Boolean(decisionReplay), 'Canonical decision_replay.py is missing');
if (decisionReplay) {
  for (const copy of decisionReplayCopies) {
    assert(exists(copy), `Decision replay copy is missing: ${copy}`);
    if (exists(copy)) {
      const content = fs.readFileSync(copy, 'utf-8');
      assert(content === decisionReplay, `Decision replay copy is stale: ${copy}`);
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
