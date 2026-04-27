import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import ora from 'ora';
import chalk from 'chalk';
import { getSkillsDir, listSkills, copyDir, removeDir } from '../utils.js';

const CLAUDE_PLUGINS_DIR = path.join(os.homedir(), '.claude', 'plugins');
const MARKETPLACE_DIR = path.join(CLAUDE_PLUGINS_DIR, 'marketplaces', 'lode');
const PLUGIN_SUBDIR = path.join(MARKETPLACE_DIR, 'lode');
const CACHE_DIR = path.join(CLAUDE_PLUGINS_DIR, 'cache', 'lode', 'lode', '1.0.0');
const KNOWN_MARKETPLACES_FILE = path.join(CLAUDE_PLUGINS_DIR, 'known_marketplaces.json');
const INSTALLED_PLUGINS_FILE = path.join(CLAUDE_PLUGINS_DIR, 'installed_plugins.json');

const PLUGIN_VERSION = '1.0.0';
const PLUGIN_DESCRIPTION = '从开发活动中开采值得留下的东西：变更追踪、文档生成、日报更新、周报大纲、月度回顾';
const AUTHOR = { name: 'Kennywu', email: 'jdlow@live.cn' };

interface InstallResult {
  installed: string[];
  pluginDir: string;
}

export function isInstalled(): boolean {
  return fs.existsSync(path.join(MARKETPLACE_DIR, '.claude-plugin', 'marketplace.json'));
}

export function install(): InstallResult {
  const spinner = ora('Installing skills to Claude Code...').start();
  const skillsDir = getSkillsDir();
  const skills = listSkills();

  // 1. Clean existing installation
  removeDir(MARKETPLACE_DIR);
  removeDir(CACHE_DIR);

  // 2. Create marketplace structure
  //    marketplaces/lode/.claude-plugin/marketplace.json
  const marketplaceMetaDir = path.join(MARKETPLACE_DIR, '.claude-plugin');
  fs.mkdirSync(marketplaceMetaDir, { recursive: true });
  fs.writeFileSync(
    path.join(marketplaceMetaDir, 'marketplace.json'),
    JSON.stringify({
      '$schema': 'https://anthropic.com/claude-code/marketplace.schema.json',
      name: 'lode',
      description: PLUGIN_DESCRIPTION,
      owner: AUTHOR,
      plugins: [
        {
          name: 'lode',
          description: 'Development workflow skills: session recap, daily notes, weekly outlines, monthly reviews, and architecture docs',
          version: PLUGIN_VERSION,
          author: AUTHOR,
          source: './lode',
        },
      ],
    }, null, 2),
    'utf-8',
  );

  // 3. Create plugin subdirectory with plugin.json + skills/
  //    marketplaces/lode/lode/.claude-plugin/plugin.json
  //    marketplaces/lode/lode/skills/lode-*/
  const pluginMetaDir = path.join(PLUGIN_SUBDIR, '.claude-plugin');
  fs.mkdirSync(pluginMetaDir, { recursive: true });
  fs.writeFileSync(
    path.join(pluginMetaDir, 'plugin.json'),
    JSON.stringify({
      name: 'lode',
      version: PLUGIN_VERSION,
      description: PLUGIN_DESCRIPTION,
      author: AUTHOR,
    }, null, 2),
    'utf-8',
  );

  const pluginSkillsDir = path.join(PLUGIN_SUBDIR, 'skills');
  fs.mkdirSync(pluginSkillsDir, { recursive: true });
  for (const skill of skills) {
    const src = path.join(skillsDir, skill);
    const dest = path.join(pluginSkillsDir, skill);
    copyDir(src, dest);
  }

  // 4. Create cache copy (what Claude Code actually loads)
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  copyDir(pluginMetaDir, path.join(CACHE_DIR, '.claude-plugin'));
  copyDir(pluginSkillsDir, path.join(CACHE_DIR, 'skills'));

  // 5. Register in known_marketplaces.json
  registerMarketplace();

  // 6. Register in installed_plugins.json
  registerInstalledPlugin();

  spinner.succeed(`Installed ${skills.length} skills to Claude Code`);
  return { installed: skills, pluginDir: MARKETPLACE_DIR };
}

export function getInstallPath(): string {
  return MARKETPLACE_DIR;
}

// --- Registration helpers ---

function readJsonFile(filePath: string): Record<string, unknown> {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

function writeJsonFile(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function registerMarketplace(): void {
  const data = readJsonFile(KNOWN_MARKETPLACES_FILE) as Record<string, unknown>;
  data['lode'] = {
    source: {
      source: 'directory',
      path: MARKETPLACE_DIR,
    },
    installLocation: MARKETPLACE_DIR,
    lastUpdated: new Date().toISOString(),
  };
  writeJsonFile(KNOWN_MARKETPLACES_FILE, data);
}

function registerInstalledPlugin(): void {
  const data = readJsonFile(INSTALLED_PLUGINS_FILE) as Record<string, unknown>;
  const plugins = (data['plugins'] || {}) as Record<string, unknown[]>;

  const now = new Date().toISOString();
  plugins['lode@lode'] = [
    {
      scope: 'user',
      installPath: CACHE_DIR,
      version: PLUGIN_VERSION,
      installedAt: now,
      lastUpdated: now,
    },
  ];
  data['plugins'] = plugins;

  // Ensure version field exists
  if (!data['version']) data['version'] = 2;

  writeJsonFile(INSTALLED_PLUGINS_FILE, data);
}
