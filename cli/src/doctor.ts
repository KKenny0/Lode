import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { readConfig, getConfigPath, expandHome } from './config.js';
import { OFFICIAL_SKILLS } from './utils.js';
import * as codex from './installers/codex.js';
import * as claudeCode from './installers/claude-code.js';

interface DoctorOptions {
  cwd?: string;
  vault?: string;
  skipInstallCheck?: boolean;
  noWrite?: boolean;
  json?: boolean;
}

interface CheckResult {
  name: string;
  ok: boolean;
  message: string;
  fix?: string;
}

function pass(name: string, message: string): CheckResult {
  return { name, ok: true, message };
}

function fail(name: string, message: string, fix: string): CheckResult {
  return { name, ok: false, message, fix };
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'project';
}

function isWritableDirectory(dir: string): boolean {
  try {
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function installedSkillsIn(dir: string): string[] {
  return OFFICIAL_SKILLS.filter(skill => fs.existsSync(path.join(dir, skill, 'SKILL.md')));
}

function checkSkillInstallation(skipInstallCheck: boolean | undefined): CheckResult {
  if (skipInstallCheck) {
    return pass('skill installation', 'Skipped by --skip-install-check');
  }

  const codexDir = codex.getInstallPath();
  const claudeMarketplace = claudeCode.getInstallPath();
  const claudeSkillsDir = path.join(claudeMarketplace, 'lode', 'skills');

  const codexSkills = installedSkillsIn(codexDir);
  const claudeSkills = installedSkillsIn(claudeSkillsDir);
  const installed = codexSkills.length === OFFICIAL_SKILLS.length
    || claudeSkills.length === OFFICIAL_SKILLS.length;

  if (installed) {
    const targets = [
      codexSkills.length === OFFICIAL_SKILLS.length ? `Codex: ${codexDir}` : null,
      claudeSkills.length === OFFICIAL_SKILLS.length ? `Claude Code: ${claudeSkillsDir}` : null,
    ].filter(Boolean).join('; ');
    return pass('skill installation', `Found all official skills (${targets})`);
  }

  const missingCodex = OFFICIAL_SKILLS.filter(skill => !codexSkills.includes(skill));
  const missingClaude = OFFICIAL_SKILLS.filter(skill => !claudeSkills.includes(skill));
  return fail(
    'skill installation',
    `Missing skills. Codex missing: ${missingCodex.join(', ') || 'none'}; Claude Code missing: ${missingClaude.join(', ') || 'none'}`,
    'Run `lode setup` and choose Codex, Claude Code, or Both.',
  );
}

function resolveVault(options: DoctorOptions, results: CheckResult[]): string | null {
  if (options.vault) {
    const resolved = path.resolve(expandHome(options.vault));
    results.push(pass('config', `Using --vault override: ${resolved}`));
    return resolved;
  }

  const cfg = readConfig();
  if (!cfg || !cfg.knowledge_vault) {
    results.push(fail(
      'config',
      `No usable config found at ${getConfigPath()}`,
      'Run `lode setup` or pass `lode doctor --vault /path/to/vault`.',
    ));
    return null;
  }

  results.push(pass('config', `Loaded ${getConfigPath()}`));
  return path.resolve(expandHome(cfg.knowledge_vault));
}

function checkTemporaryWrite(vault: string, cwd: string, noWrite: boolean | undefined): CheckResult[] {
  if (noWrite) {
    return [pass('temporary raw write', 'Skipped by --no-write')];
  }

  const slug = slugify(path.basename(cwd));
  const doctorDir = path.join(vault, '.lode-doctor');
  const weekDir = path.join(doctorDir, 'raw', 'weeks', '2099-W01');
  const rawFile = path.join(weekDir, `${slug}.json`);
  const weeklyDir = path.join(doctorDir, 'Work Diary', 'Weekly');

  try {
    fs.mkdirSync(weekDir, { recursive: true });
    fs.writeFileSync(rawFile, JSON.stringify([
      {
        timestamp: '2099-01-01T00:00:00+00:00',
        type: 'decision',
        summary: 'Verified Lode doctor can write a temporary raw entry',
        context: 'This entry is created under .lode-doctor and removed before the command exits.',
        source: 'session-recap',
        status: 'done',
      },
    ], null, 2) + '\n', 'utf-8');
    fs.mkdirSync(weeklyDir, { recursive: true });
    fs.rmSync(doctorDir, { recursive: true, force: true });
    return [
      pass('temporary raw write', `Created and removed temporary raw entry for slug ${slug}`),
      pass('weekly output directory', 'Created and removed temporary weekly output directory'),
    ];
  } catch (error) {
    try {
      fs.rmSync(doctorDir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
    return [fail(
      'temporary write',
      error instanceof Error ? error.message : String(error),
      'Check vault permissions or rerun with --no-write to skip write checks.',
    )];
  }
}

export async function runDoctor(options: DoctorOptions = {}): Promise<void> {
  const results: CheckResult[] = [];
  const cwd = path.resolve(options.cwd || process.cwd());
  const vault = resolveVault(options, results);

  if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
    results.push(fail('current directory', `Not a directory: ${cwd}`, 'Run doctor from a project directory or pass --cwd.'));
  } else {
    results.push(pass('current directory', cwd));
    results.push(pass('project slug', slugify(path.basename(cwd))));
  }

  if (vault) {
    if (!fs.existsSync(vault)) {
      results.push(fail('vault exists', `Vault does not exist: ${vault}`, 'Create the directory or update knowledge_vault.'));
    } else if (!fs.statSync(vault).isDirectory()) {
      results.push(fail('vault exists', `Vault path is not a directory: ${vault}`, 'Set knowledge_vault to a directory path.'));
    } else {
      results.push(pass('vault exists', vault));
      if (isWritableDirectory(vault)) {
        results.push(pass('vault writable', vault));
        results.push(...checkTemporaryWrite(vault, cwd, options.noWrite));
      } else {
        results.push(fail('vault writable', `Vault is not writable: ${vault}`, 'Fix permissions or choose another vault.'));
      }
    }
  }

  results.push(checkSkillInstallation(options.skipInstallCheck));

  if (options.json) {
    console.log(JSON.stringify({ ok: results.every(result => result.ok), results }, null, 2));
  } else {
    console.log(chalk.bold('\nLode doctor\n'));
    for (const result of results) {
      const marker = result.ok ? chalk.green('PASS') : chalk.red('FAIL');
      console.log(`${marker} ${chalk.bold(result.name)} - ${result.message}`);
      if (!result.ok && result.fix) {
        console.log(`     ${chalk.gray(result.fix)}`);
      }
    }
  }

  if (!results.every(result => result.ok)) {
    process.exitCode = 1;
  }
}
