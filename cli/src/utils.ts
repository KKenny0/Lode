import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Path to the bundled skills directory.
 * In dev: ../skills (relative to dist/)
 * In published package: ./skills (relative to dist/)
 */
export function getSkillsDir(): string {
  // Check for published package layout first (skills/ next to dist/)
  const published = path.join(__dirname, '..', 'skills');
  if (fs.existsSync(published)) return published;

  // Dev layout: cli/dist/ → ../../skills
  const dev = path.join(__dirname, '..', '..', 'skills');
  if (fs.existsSync(dev)) return dev;

  throw new Error('Cannot find skills directory. Run `npm run copy-skills` first.');
}

const EXCLUDED_RESOURCE_DIRS = new Set(['evals']);

function isSkillDirectory(dir: string, name: string): boolean {
  if (!name.startsWith('lode-')) return false;
  if (name.endsWith('-workspace')) return false;
  const fullPath = path.join(dir, name);
  return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'SKILL.md'));
}

function shouldSkipCopy(entryName: string): boolean {
  return entryName.endsWith('-workspace') || EXCLUDED_RESOURCE_DIRS.has(entryName);
}

/** List all installable lode-* skill directories */
export function listSkills(): string[] {
  const dir = getSkillsDir();
  return fs.readdirSync(dir)
    .filter(name => isSkillDirectory(dir, name));
}

/** Copy a directory recursively */
export function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.isDirectory() && shouldSkipCopy(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** Remove a directory recursively */
export function removeDir(dir: string): void {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}
