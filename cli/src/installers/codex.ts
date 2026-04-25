import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import ora from 'ora';
import { getSkillsDir, listSkills, copyDir, removeDir } from '../utils.js';

const CODEX_SKILLS_DIR = path.join(os.homedir(), '.agents', 'skills');

interface InstallResult {
  installed: string[];
  skillsDir: string;
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
