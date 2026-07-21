#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cliRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entrypoint = path.join(cliRoot, 'dist', 'index.js');
const repoRoot = path.resolve(cliRoot, '..');

if (!fs.existsSync(entrypoint)) {
  console.error('Missing CLI build output. Run `npm run build` before doctor tests.');
  process.exit(1);
}

function mkTempDir(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `tracework-${name}-`));
}

function runDoctor(args, env = {}) {
  return runCli(['doctor', ...args], env);
}

function runCli(args, env = {}) {
  return spawnSync(process.execPath, [entrypoint, ...args], {
    cwd: path.resolve(cliRoot, '..'),
    env: { ...process.env, ...env },
    encoding: 'utf-8',
  });
}

function parseJson(stdout) {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`Expected JSON stdout, got:\n${stdout}\n${error}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertResult(results, name, ok) {
  const result = results.find(item => item.name === name);
  assert(result, `Missing doctor result: ${name}`);
  assert(result.ok === ok, `Expected ${name} ok=${ok}, got ${result.ok}`);
  return result;
}

function writeConfig(home, content) {
  const configDir = path.join(home, '.tracework');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(path.join(configDir, 'config.yaml'), content, 'utf-8');
}

function readCodexPluginVersion() {
  const manifestPath = path.join(repoRoot, '.codex-plugin', 'plugin.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  return manifest.version;
}

function homeEnv(home) {
  // Windows temp directories live under the real user profile. Create an
  // empty nearest config so ancestor discovery cannot leak the real global
  // ~/.tracework/config.yaml into an otherwise isolated test home.
  const configDir = path.join(home, '.tracework');
  const configPath = path.join(configDir, 'config.yaml');
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(configPath, '{}\n', 'utf-8');
  }
  return { HOME: home, USERPROFILE: home };
}

const tempDirs = [];

try {
  const vault = mkTempDir('doctor-vault');
  const successCwd = mkTempDir('doctor-cwd');
  tempDirs.push(vault, successCwd);
  const success = runDoctor(['--cwd', successCwd, '--vault', vault, '--skip-install-check', '--json']);
  assert(success.status === 0, `Expected success doctor exit 0, got ${success.status}\n${success.stderr}`);
  const successJson = parseJson(success.stdout);
  assert(successJson.ok === true, 'Expected success doctor ok=true');
  assertResult(successJson.results, 'vault writable', true);
  assertResult(successJson.results, 'temporary raw write', true);
  assert(!fs.existsSync(path.join(vault, '.tracework-doctor')), 'Doctor temporary directory was not cleaned up');

  const noConfigHome = mkTempDir('doctor-no-config-home');
  tempDirs.push(noConfigHome);
  const noConfig = runDoctor(['--cwd', noConfigHome, '--skip-install-check', '--no-write', '--json'], homeEnv(noConfigHome));
  assert(noConfig.status !== 0, 'Expected no-config doctor to fail');
  const noConfigJson = parseJson(noConfig.stdout);
  assert(noConfigJson.ok === false, 'Expected no-config doctor ok=false');
  const noConfigResult = assertResult(noConfigJson.results, 'config', false);
  assert(noConfigResult.message.includes('.tracework'), 'Expected no-config message to mention .tracework config');

  const missingInstallHome = mkTempDir('doctor-install-home');
  const missingInstallVault = mkTempDir('doctor-install-vault');
  const missingInstallCodexHome = mkTempDir('doctor-install-codex-home');
  tempDirs.push(missingInstallHome, missingInstallVault, missingInstallCodexHome);
  const missingInstall = runDoctor(['--cwd', missingInstallHome, '--vault', missingInstallVault, '--no-write', '--json'], {
    ...homeEnv(missingInstallHome),
    CODEX_HOME: missingInstallCodexHome,
  });
  assert(missingInstall.status !== 0, 'Expected missing-install doctor to fail');
  const missingInstallJson = parseJson(missingInstall.stdout);
  const installResult = assertResult(missingInstallJson.results, 'skill installation', false);
  assert(installResult.message.includes('Missing skills'), 'Expected missing-install message');
  assert(installResult.fix.includes('codex plugin marketplace add KKenny0/Tracework'), 'Expected install fix to mention native marketplace add');
  assert(installResult.fix.includes('codex plugin add tracework@tracework'), 'Expected install fix to mention native plugin add');
  const legacyInstallerCommand = ['install', 'codex', 'plugin'].join('-');
  assert(!installResult.fix.includes(legacyInstallerCommand), 'Expected install fix to omit legacy fallback');

  const codexHome = mkTempDir('doctor-codex-home');
  const codexInstallHome = mkTempDir('doctor-codex-install-home');
  const codexInstallVault = mkTempDir('doctor-codex-install-vault');
  tempDirs.push(codexHome, codexInstallHome, codexInstallVault);
  const nativeSkillsPath = path.join(codexHome, 'plugins', 'cache', 'tracework', 'tracework', readCodexPluginVersion(), 'skills');
  fs.mkdirSync(path.dirname(nativeSkillsPath), { recursive: true });
  fs.cpSync(path.join(repoRoot, 'skills'), nativeSkillsPath, { recursive: true });
  const codexDoctor = runDoctor(['--cwd', codexInstallHome, '--vault', codexInstallVault, '--no-write', '--json'], {
    ...homeEnv(codexInstallHome),
    CODEX_HOME: codexHome,
  });
  assert(codexDoctor.status === 0, `Expected doctor to find Codex plugin install, got ${codexDoctor.status}\n${codexDoctor.stderr}`);
  const codexDoctorJson = parseJson(codexDoctor.stdout);
  const codexInstallResult = assertResult(codexDoctorJson.results, 'skill installation', true);
  assert(codexInstallResult.message.includes('Codex plugin'), 'Expected doctor to report Codex plugin install');

  const minimalConfigHome = mkTempDir('doctor-minimal-config-home');
  const minimalConfigVault = mkTempDir('doctor-minimal-config-vault');
  tempDirs.push(minimalConfigHome, minimalConfigVault);
  writeConfig(minimalConfigHome, `knowledge_vault: ${minimalConfigVault.replaceAll('\\', '/')}\n`);
  const minimalConfig = runDoctor(['--cwd', minimalConfigHome, '--skip-install-check', '--no-write', '--json'], homeEnv(minimalConfigHome));
  assert(minimalConfig.status === 0, `Expected minimal config doctor to pass, got ${minimalConfig.status}\n${minimalConfig.stderr}`);
  const minimalConfigJson = parseJson(minimalConfig.stdout);
  assertResult(minimalConfigJson.results, 'arch doc output dir', true);
  const minimalArtifactIndex = assertResult(minimalConfigJson.results, 'artifact index', true);
  assert(minimalArtifactIndex.message.includes('enabled'), 'Expected artifact index to default to enabled');

  const governanceConfigHome = mkTempDir('doctor-governance-config-home');
  const governanceConfigVault = mkTempDir('doctor-governance-config-vault');
  tempDirs.push(governanceConfigHome, governanceConfigVault);
  writeConfig(governanceConfigHome, [
    `knowledge_vault: ${governanceConfigVault.replaceAll('\\', '/')}`,
    'arch_doc:',
    '  output_dir: ../architecture-notes',
    '  mirror_to_vault: false',
    'artifact_index:',
    '  enabled: false',
    '',
  ].join('\n'));
  const governanceConfig = runDoctor(['--cwd', governanceConfigHome, '--skip-install-check', '--no-write', '--json'], homeEnv(governanceConfigHome));
  assert(governanceConfig.status === 0, `Expected governance config doctor to pass, got ${governanceConfig.status}\n${governanceConfig.stderr}`);
  const governanceConfigJson = parseJson(governanceConfig.stdout);
  const archDocResult = assertResult(governanceConfigJson.results, 'arch doc output dir', true);
  assert(archDocResult.message.includes('architecture-notes'), 'Expected arch doc output dir to be reported');
  const artifactIndexResult = assertResult(governanceConfigJson.results, 'artifact index', true);
  assert(artifactIndexResult.message.includes('disabled'), 'Expected artifact index disabled setting to be reported');

  const projectConfigHome = mkTempDir('doctor-project-config-home');
  const projectConfigVault = mkTempDir('doctor-project-config-vault');
  const projectCwd = mkTempDir('doctor-project-cwd');
  tempDirs.push(projectConfigHome, projectConfigVault, projectCwd);
  writeConfig(projectCwd, [
    `knowledge_vault: ${projectConfigVault.replaceAll('\\', '/')}`,
    'arch_doc:',
    '  output_dir: project-docs',
    '',
  ].join('\n'));
  const projectConfig = runDoctor(['--cwd', projectCwd, '--skip-install-check', '--no-write', '--json'], homeEnv(projectConfigHome));
  assert(projectConfig.status === 0, `Expected project config doctor to pass, got ${projectConfig.status}\n${projectConfig.stderr}`);
  const projectConfigJson = parseJson(projectConfig.stdout);
  const projectArchDoc = assertResult(projectConfigJson.results, 'arch doc output dir', true);
  assert(projectArchDoc.message.endsWith(path.join(projectCwd, 'project-docs')), 'Expected project-level arch_doc.output_dir to resolve from --cwd');

  console.log('Doctor tests passed.');
} finally {
  for (const dir of tempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
