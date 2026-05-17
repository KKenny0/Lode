import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import ora from 'ora';
import { getAssetsDir, getSkillsDir, listSkills, copyDir, removeDir } from '../utils.js';

const CODEX_SKILLS_DIR = path.join(os.homedir(), '.agents', 'skills');
export const PLUGIN_MARKETPLACE = 'lode-marketplace';
export const PLUGIN_NAME = 'lode';
export const PLUGIN_VERSION = '0.1.0';
export const PLUGIN_KEY = `${PLUGIN_NAME}@${PLUGIN_MARKETPLACE}`;

interface InstallResult {
  installed: string[];
  skillsDir: string;
}

export interface PluginInstallOptions {
  codexHome?: string;
  skipConfig?: boolean;
}

export interface PluginInstallResult {
  pluginDir: string;
  configPath: string;
  pluginKey: string;
  configured: boolean;
}

export function isInstalled(): boolean {
  const skills = listSkills();
  return skills.some(skill => fs.existsSync(path.join(CODEX_SKILLS_DIR, skill)));
}

export function install(): InstallResult {
  const spinner = ora('Installing skills to Codex...').start();
  const skillsDir = getSkillsDir();
  const skills = listSkills();

  fs.mkdirSync(CODEX_SKILLS_DIR, { recursive: true });

  for (const skill of skills) {
    const src = path.join(skillsDir, skill);
    const dest = path.join(CODEX_SKILLS_DIR, skill);
    // Clean existing skill directory before copy
    removeDir(dest);
    copyDir(src, dest);
  }

  spinner.succeed(`Installed ${skills.length} skills to Codex`);
  return { installed: skills, skillsDir: CODEX_SKILLS_DIR };
}

export function getInstallPath(): string {
  return CODEX_SKILLS_DIR;
}

export function getCodexHome(override?: string): string {
  return path.resolve(expandHome(override || process.env.CODEX_HOME || path.join(os.homedir(), '.codex')));
}

export function getPluginInstallPath(codexHomeOverride?: string): string {
  return path.join(getCodexHome(codexHomeOverride), 'plugins', 'cache', PLUGIN_MARKETPLACE, PLUGIN_NAME, PLUGIN_VERSION);
}

export function getPluginSkillsPath(codexHomeOverride?: string): string {
  return path.join(getPluginInstallPath(codexHomeOverride), 'skills');
}

export function isPluginInstalled(codexHomeOverride?: string): boolean {
  const pluginDir = getPluginInstallPath(codexHomeOverride);
  return fs.existsSync(path.join(pluginDir, '.codex-plugin', 'plugin.json'))
    && fs.existsSync(path.join(pluginDir, 'skills', 'capture', 'SKILL.md'));
}

export function installPlugin(options: PluginInstallOptions = {}): PluginInstallResult {
  const codexHome = getCodexHome(options.codexHome);
  const pluginDir = getPluginInstallPath(codexHome);
  const spinner = ora('Installing Lode Codex plugin...').start();
  const skillsDir = getSkillsDir();
  const skills = listSkills();

  removeDir(pluginDir);
  fs.mkdirSync(path.join(pluginDir, '.codex-plugin'), { recursive: true });
  fs.mkdirSync(path.join(pluginDir, 'skills'), { recursive: true });
  const assetsDir = getAssetsDir();
  if (assetsDir) {
    copyDir(assetsDir, path.join(pluginDir, 'assets'));
  }
  fs.writeFileSync(
    path.join(pluginDir, '.codex-plugin', 'plugin.json'),
    JSON.stringify(codexPluginManifest(), null, 2) + '\n',
    'utf-8',
  );

  for (const skill of skills) {
    copyDir(path.join(skillsDir, skill), path.join(pluginDir, 'skills', skill));
  }

  const configPath = path.join(codexHome, 'config.toml');
  if (!options.skipConfig) {
    enablePluginInConfig(configPath, PLUGIN_KEY);
  }

  spinner.succeed(`Installed Lode Codex plugin to ${pluginDir}`);
  return { pluginDir, configPath, pluginKey: PLUGIN_KEY, configured: !options.skipConfig };
}

function expandHome(value: string): string {
  if (value === '~') return os.homedir();
  if (value.startsWith('~/')) return path.join(os.homedir(), value.slice(2));
  return value;
}

function codexPluginManifest(): object {
  return {
    '$schema': 'https://developers.openai.com/codex/schemas/plugin.schema.json',
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
    description: 'Agentic coding persistent memory: capture the why, then compound it into reports, reviews, and decision roadmaps.',
    author: {
      name: 'Kennywu',
      email: 'jdlow@live.cn',
    },
    license: 'MIT',
    repository: 'https://github.com/KKenny0/Lode',
    homepage: 'https://github.com/KKenny0/Lode',
    keywords: [
      'agentic coding',
      'memory',
      'weekly reports',
      'decision roadmap',
      'daily notes',
    ],
    skills: './skills/',
    interface: {
      displayName: 'Lode',
      shortDescription: 'Persistent memory and decision replay for agentic coding',
      longDescription: 'Capture session decisions, abandoned paths, risks, and open questions, then reuse them for recall, daily notes, weekly outlines, monthly reviews, and decision roadmaps.',
      developerName: 'Kennywu',
      category: 'Productivity',
      capabilities: ['Read', 'Write'],
      websiteURL: 'https://github.com/KKenny0/Lode',
      composerIcon: './assets/mark.svg',
      logo: './assets/logo.png',
      brandColor: '#25636A',
      defaultPrompt: [
        'Use Lode to capture this session with /lode:capture.',
        'Use Lode to recall recent project decisions with /lode:recall.',
        'Use Lode to query cited decision evidence with /lode:query.',
      ],
      screenshots: [
        './assets/lode-three-actions.png',
      ],
    },
  };
}

function enablePluginInConfig(configPath: string, pluginKey: string): void {
  const existing = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf-8').split(/\r?\n/) : [];
  let lines = setTableKey(existing, '[features]', 'plugins', 'true');
  lines = setTableKey(lines, `[plugins."${pluginKey}"]`, 'enabled', 'true');
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, `${lines.join('\n').trimEnd()}\n`, 'utf-8');
}

function setTableKey(inputLines: string[], header: string, key: string, value: string): string[] {
  const output: string[] = [];
  let inside = false;
  let seen = false;
  let hasKey = false;

  for (const line of inputLines) {
    const stripped = line.trim();
    if (stripped.startsWith('[') && stripped.endsWith(']')) {
      if (inside && !hasKey) output.push(`${key} = ${value}`);
      inside = stripped === header;
      seen = seen || inside;
      hasKey = false;
    }
    if (inside && stripped.includes('=') && stripped.split('=', 1)[0].trim() === key) {
      output.push(`${key} = ${value}`);
      hasKey = true;
    } else {
      output.push(line);
    }
  }

  if (inside && !hasKey) output.push(`${key} = ${value}`);
  if (!seen) {
    if (output.length > 0 && output[output.length - 1] !== '') output.push('');
    output.push(header, `${key} = ${value}`);
  }
  return output;
}
