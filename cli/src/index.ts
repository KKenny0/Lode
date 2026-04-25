#!/usr/bin/env node
import { Command } from 'commander';
import { runWizard } from './wizard.js';
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

// Default: run wizard if no command specified
program.action(runWizard);

program.parse();
