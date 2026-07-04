#!/usr/bin/env node
import { Command } from 'commander';
import { runDoctor } from './doctor.js';
import { VERSION } from './logo.js';

const program = new Command();

program
  .name('tracework')
  .description('Tracework maintenance CLI')
  .version(VERSION);

program
  .command('doctor')
  .description('Check Tracework configuration, vault access, and plugin installation')
  .option('--cwd <path>', 'Project directory to inspect')
  .option('--vault <path>', 'Knowledge vault override for diagnostics')
  .option('--skip-install-check', 'Skip checking installed Codex/Claude Code skills')
  .option('--no-write', 'Skip temporary write checks')
  .option('--json', 'Print machine-readable JSON')
  .action(runDoctor);

program.action(() => {
  program.help();
});

program.parse();
