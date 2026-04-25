import inquirer from 'inquirer';
import chalk from 'chalk';
import { showLogo } from './logo.js';
import { readConfig, writeConfig, validateVaultPath } from './config.js';
import * as claudeCode from './installers/claude-code.js';
import * as codex from './installers/codex.js';
import type { LodeConfig } from './config.js';

type Platform = 'claude-code' | 'codex' | 'both';

interface WizardAnswers {
  platform: Platform;
  vaultPath: string;
}

export async function runWizard(): Promise<void> {
  showLogo();

  // Step 1: Check existing config
  const existing = readConfig();

  // Step 2: Platform selection
  const { platform } = await inquirer.prompt<{ platform: Platform }>([{
    type: 'list',
    name: 'platform',
    message: 'Install skills for which platform?',
    choices: [
      { name: 'Claude Code', value: 'claude-code' },
      { name: 'Codex (OpenAI)', value: 'codex' },
      { name: 'Both', value: 'both' },
    ],
  }]);

  // Step 3: Vault path
  const defaultVault = existing?.knowledge_vault || '';
  const { vaultPath } = await inquirer.prompt<{ vaultPath: string }>([{
    type: 'input',
    name: 'vaultPath',
    message: 'Knowledge vault path (git repo for storing dev logs):',
    default: defaultVault,
    validate: (input: string) => {
      if (!input.trim()) return 'Path is required';
      return validateVaultPath(input);
    },
  }]);

  // Step 4: Write config
  const config: LodeConfig = { knowledge_vault: vaultPath };
  writeConfig(config);
  console.log(chalk.gray(`  Config saved to ~/.lode/config.yaml\n`));

  // Step 5: Install skills
  console.log(chalk.bold('Installing skills...\n'));

  const results: { platform: string; path: string }[] = [];

  if (platform === 'claude-code' || platform === 'both') {
    const result = claudeCode.install();
    results.push({ platform: 'Claude Code', path: result.pluginDir });
  }

  if (platform === 'codex' || platform === 'both') {
    const result = codex.install();
    results.push({ platform: 'Codex', path: result.skillsDir });
  }

  // Step 6: Summary
  console.log('\n' + chalk.bold.green('Done! Skills installed:\n'));
  for (const r of results) {
    console.log(`  ${chalk.cyan(r.platform)} → ${chalk.gray(r.path)}`);
  }
  console.log(`\n  ${chalk.gray('Knowledge vault:')} ${vaultPath}`);
  console.log(`  ${chalk.gray('Config file:')} ~/.lode/config.yaml`);

  console.log(chalk.gray('\n  Run `lode` again to reconfigure or update.\n'));
}
