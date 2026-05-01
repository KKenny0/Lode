import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';

export interface LodeConfig {
  knowledge_vault: string;
  project_slug?: string;
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
