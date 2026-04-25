import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import ora from 'ora';
import chalk from 'chalk';
import { getSkillsDir, listSkills, copyDir, removeDir } from '../utils.js';

const CLAUDE_PLUGINS_DIR = path.join(os.homedir(), '.claude', 'plugins', 'marketplaces');
const LODE_PLUGIN_DIR = path.join(CLAUDE_PLUGINS_DIR, 'lode');

interface InstallResult {
  installed: string[];
  pluginDir: string;
}

export function isInstalled(): boolean {
  return fs.existsSync(path.join(LODE_PLUGIN_DIR, '.claude-plugin', 'plugin.json'));
}

export function install(): InstallResult {
  const spinner = ora('Installing skills to Claude Code...').start();
  const skillsDir = getSkillsDir();
  const skills = listSkills();

  // Clean existing installation
  removeDir(LODE_PLUGIN_DIR);
  fs.mkdirSync(LODE_PLUGIN_DIR, { recursive: true });

  // Copy each skill
  for (const skill of skills) {
    const src = path.join(skillsDir, skill);
    const dest = path.join(LODE_PLUGIN_DIR, skill);
    copyDir(src, dest);
  }

  // Write plugin manifest
  const pluginDir = path.join(LODE_PLUGIN_DIR, '.claude-plugin');
  fs.mkdirSync(pluginDir, { recursive: true });
  fs.writeFileSync(
    path.join(pluginDir, 'plugin.json'),
    JSON.stringify({
      name: 'lode',
      description: '从开发活动中开采值得留下的东西：变更追踪、文档生成、日报更新、周报大纲、月度回顾',
      author: { name: 'Kennywu' },
    }, null, 2),
    'utf-8'
  );

  spinner.succeed(`Installed ${skills.length} skills to Claude Code`);
  return { installed: skills, pluginDir: LODE_PLUGIN_DIR };
}

export function getInstallPath(): string {
  return LODE_PLUGIN_DIR;
}
