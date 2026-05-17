#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(cliRoot, '..');
const sourceSkillsDir = path.join(repoRoot, 'skills');
const bundledSkillsDir = path.join(cliRoot, 'skills');

const officialSkills = [
  'capture',
  'recall',
  'query',
  'daily',
  'weekly',
  'monthly',
  'roadmap',
  'cold-start-interview',
];

function shouldSkip(name) {
  return name === 'evals' || name.endsWith('-workspace') || name === '__pycache__';
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.isDirectory() && shouldSkip(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

fs.rmSync(bundledSkillsDir, { recursive: true, force: true });
fs.mkdirSync(bundledSkillsDir, { recursive: true });

for (const skill of officialSkills) {
  const skillPath = path.join(sourceSkillsDir, skill);
  if (!fs.existsSync(path.join(skillPath, 'SKILL.md'))) continue;
  copyDir(skillPath, path.join(bundledSkillsDir, skill));
}

console.log(`Copied skills to ${bundledSkillsDir}`);
