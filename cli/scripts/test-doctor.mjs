#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cliRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entrypoint = path.join(cliRoot, 'dist', 'index.js');

if (!fs.existsSync(entrypoint)) {
  console.error('Missing CLI build output. Run `npm run build` before doctor tests.');
  process.exit(1);
}

function mkTempDir(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `lode-${name}-`));
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
  const configDir = path.join(home, '.lode');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(path.join(configDir, 'config.yaml'), content, 'utf-8');
}

function homeEnv(home) {
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
  assert(!fs.existsSync(path.join(vault, '.lode-doctor')), 'Doctor temporary directory was not cleaned up');

  const cleanHome = mkTempDir('doctor-home');
  tempDirs.push(cleanHome);
  const legacyDefault = runDoctor(['--cwd', cleanHome, '--skip-install-check', '--no-write', '--json'], {
    ...homeEnv(cleanHome),
    WEEKLY_PPT_PATH: '',
  });
  assert(legacyDefault.status !== 0, 'Expected legacy-default doctor to fail until ~/.weekly-ppt exists');
  const legacyDefaultJson = parseJson(legacyDefault.stdout);
  assert(legacyDefaultJson.ok === false, 'Expected legacy-default doctor ok=false');
  assertResult(legacyDefaultJson.results, 'config', true);
  const legacyDefaultVault = assertResult(legacyDefaultJson.results, 'vault exists', false);
  assert(legacyDefaultVault.message.includes('.weekly-ppt'), 'Expected fallback vault to use ~/.weekly-ppt');

  const envFallbackHome = mkTempDir('doctor-env-fallback-home');
  const envFallbackVault = mkTempDir('doctor-env-fallback-vault');
  tempDirs.push(envFallbackHome, envFallbackVault);
  const envFallback = runDoctor(['--cwd', envFallbackHome, '--skip-install-check', '--no-write', '--json'], {
    ...homeEnv(envFallbackHome),
    WEEKLY_PPT_PATH: envFallbackVault,
  });
  assert(envFallback.status === 0, `Expected WEEKLY_PPT_PATH fallback doctor to pass, got ${envFallback.status}\n${envFallback.stderr}`);
  const envFallbackJson = parseJson(envFallback.stdout);
  assert(envFallbackJson.ok === true, 'Expected WEEKLY_PPT_PATH fallback doctor ok=true');
  const envFallbackVaultResult = assertResult(envFallbackJson.results, 'vault exists', true);
  assert(envFallbackVaultResult.message === envFallbackVault, 'Expected vault to come from WEEKLY_PPT_PATH');

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
  assert(installResult.fix.includes('codex plugin marketplace add KKenny0/Lode'), 'Expected install fix to mention native marketplace add');
  assert(installResult.fix.includes('codex plugin add lode@lode'), 'Expected install fix to mention native plugin add');
  assert(installResult.fix.includes('install-codex-plugin'), 'Expected install fix to keep legacy fallback');
  assert(
    installResult.fix.indexOf('codex plugin add lode@lode') < installResult.fix.indexOf('install-codex-plugin'),
    'Expected native Codex plugin command before legacy fallback',
  );

  const codexHome = mkTempDir('doctor-codex-home');
  const codexInstallHome = mkTempDir('doctor-codex-install-home');
  const codexInstallVault = mkTempDir('doctor-codex-install-vault');
  tempDirs.push(codexHome, codexInstallHome, codexInstallVault);
  const codexInstall = runCli(['install-codex-plugin', '--codex-home', codexHome], homeEnv(codexInstallHome));
  assert(codexInstall.status === 0, `Expected Codex plugin install to pass, got ${codexInstall.status}\n${codexInstall.stderr}`);
  assert(codexInstall.stdout.includes('Legacy fallback'), 'Expected install output to mark legacy fallback');
  assert(codexInstall.stdout.includes('codex plugin add lode@lode'), 'Expected install output to prefer native plugin install');
  assert(fs.existsSync(path.join(codexHome, 'plugins', 'cache', 'lode', 'lode', '0.1.0', 'skills', 'capture', 'SKILL.md')), 'Expected Codex plugin skill cache to be created');
  assert(fs.existsSync(path.join(codexHome, 'plugins', 'cache', 'lode', 'lode', '0.1.0', 'assets', 'mark.svg')), 'Expected Codex plugin assets to be created');
  const codexPluginManifest = JSON.parse(fs.readFileSync(path.join(codexHome, 'plugins', 'cache', 'lode', 'lode', '0.1.0', '.codex-plugin', 'plugin.json'), 'utf-8'));
  assert(!('$schema' in codexPluginManifest), 'Expected legacy fallback manifest to omit $schema');
  const codexConfig = fs.readFileSync(path.join(codexHome, 'config.toml'), 'utf-8');
  assert(codexConfig.includes('[features]'), 'Expected Codex config features table');
  assert(codexConfig.includes('plugins = true'), 'Expected Codex plugins feature to be enabled');
  assert(codexConfig.includes('[plugins."lode@lode"]'), 'Expected Lode plugin table');
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
