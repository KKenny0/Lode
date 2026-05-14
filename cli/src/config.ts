import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';

export interface LodeConfig {
  knowledge_vault: string;
  project_slug?: string;
  profile?: {
    project_name?: string;
    report_language?: 'zh' | 'en' | 'mixed';
    weekly_mode?: 'tech' | 'report';
    team_context?: 'solo' | 'team' | 'mixed';
  };
  arch_doc?: {
    output_dir?: string;
    mirror_to_vault?: boolean;
  };
  artifact_index?: {
    enabled?: boolean;
  };
}

const CONFIG_DIR = path.join(os.homedir(), '.lode');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.yaml');

export function expandHome(value: string): string {
  if (value === '~') return os.homedir();
  if (value.startsWith('~/')) return path.join(os.homedir(), value.slice(2));
  return value;
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function readConfig(): LodeConfig | null {
  if (!fs.existsSync(CONFIG_FILE)) return null;
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return yaml.load(raw) as LodeConfig;
  } catch {
    return null;
  }
}

function findProjectConfig(cwd: string): string | null {
  let current = path.resolve(cwd);
  while (true) {
    const candidate = path.join(current, '.lode', 'config.yaml');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function mergeConfigs(globalCfg: LodeConfig | null, projectCfg: LodeConfig | null): LodeConfig | null {
  if (!globalCfg && !projectCfg) return null;
  const merged = { ...(globalCfg || {}) } as LodeConfig;
  const mergedRecord = merged as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(projectCfg || {})) {
    const existing = mergedRecord[key];
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      existing &&
      typeof existing === 'object' &&
      !Array.isArray(existing)
    ) {
      mergedRecord[key] = {
        ...(existing as Record<string, unknown>),
        ...(value as Record<string, unknown>),
      };
    } else {
      mergedRecord[key] = value;
    }
  }
  return merged;
}

export function readConfigForCwd(cwd: string): LodeConfig | null {
  const globalCfg = readConfig();
  const projectPath = findProjectConfig(cwd);
  if (!projectPath) return globalCfg;
  try {
    const raw = fs.readFileSync(projectPath, 'utf-8');
    const projectCfg = yaml.load(raw) as LodeConfig;
    return mergeConfigs(globalCfg, projectCfg);
  } catch {
    return globalCfg;
  }
}

export function writeConfig(cfg: LodeConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const content = yaml.dump(cfg, { lineWidth: -1 });
  fs.writeFileSync(CONFIG_FILE, content, 'utf-8');
}

export function validateVaultPath(vaultPath: string): string | true {
  const resolved = path.resolve(expandHome(vaultPath));
  if (!fs.existsSync(resolved)) {
    return `路径不存在: ${resolved}`;
  }
  if (!fs.statSync(resolved).isDirectory()) {
    return `不是目录: ${resolved}`;
  }
  return true;
}
