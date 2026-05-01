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
  return spawnSync(process.execPath, [entrypoint, 'doctor', ...args], {
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

const tempDirs = [];

try {
  const vault = mkTempDir('doctor-vault');
  tempDirs.push(vault);
  const success = runDoctor(['--vault', vault, '--skip-install-check', '--json']);
  assert(success.status === 0, `Expected success doctor exit 0, got ${success.status}\n${success.stderr}`);
  const successJson = parseJson(success.stdout);
  assert(successJson.ok === true, 'Expected success doctor ok=true');
  assertResult(successJson.results, 'vault writable', true);
  assertResult(successJson.results, 'temporary raw write', true);
  assert(!fs.existsSync(path.join(vault, '.lode-doctor')), 'Doctor temporary directory was not cleaned up');

  const cleanHome = mkTempDir('doctor-home');
  tempDirs.push(cleanHome);
  const noConfig = runDoctor(['--skip-install-check', '--no-write', '--json'], { HOME: cleanHome });
  assert(noConfig.status !== 0, 'Expected no-config doctor to fail');
  const noConfigJson = parseJson(noConfig.stdout);
  assert(noConfigJson.ok === false, 'Expected no-config doctor ok=false');
  const configResult = assertResult(noConfigJson.results, 'config', false);
  assert(configResult.fix.includes('lode setup'), 'Expected no-config fix to mention lode setup');

  const missingInstallHome = mkTempDir('doctor-install-home');
  const missingInstallVault = mkTempDir('doctor-install-vault');
  tempDirs.push(missingInstallHome, missingInstallVault);
  const missingInstall = runDoctor(['--vault', missingInstallVault, '--no-write', '--json'], { HOME: missingInstallHome });
  assert(missingInstall.status !== 0, 'Expected missing-install doctor to fail');
  const missingInstallJson = parseJson(missingInstall.stdout);
  const installResult = assertResult(missingInstallJson.results, 'skill installation', false);
  assert(installResult.message.includes('Missing skills'), 'Expected missing-install message');

  console.log('Doctor tests passed.');
} finally {
  for (const dir of tempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
