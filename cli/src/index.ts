#!/usr/bin/env node
import { Command } from 'commander';
import { runWizard } from './wizard.js';
import { runDoctor } from './doctor.js';
import { VERSION } from './logo.js';

const program = new Command();

program
  .name('lode')
  .description('Lode CLI — install and configure Lode skills')
  .version(VERSION);

program
  .command('setup')
  .description('Run the interactive setup wizard')
  .action(runWizard);

program
  .command('doctor')
  .description('Check Lode configuration, vault access, and skill installation')
  .option('--cwd <path>', 'Project directory to inspect')
  .option('--vault <path>', 'Knowledge vault override for diagnostics')
  .option('--skip-install-check', 'Skip checking installed Codex/Claude Code skills')
  .option('--no-write', 'Skip temporary write checks')
  .option('--json', 'Print machine-readable JSON')
  .action(runDoctor);

// Default: run wizard if no command specified
program.action(runWizard);

program.parse();
