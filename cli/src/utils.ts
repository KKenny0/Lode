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

/** List all lode-* skill directories */
export function listSkills(): string[] {
  const dir = getSkillsDir();
  return fs.readdirSync(dir)
    .filter(name => name.startsWith('lode-') && fs.statSync(path.join(dir, name)).isDirectory());
}

/** Copy a directory recursively */
export function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
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
