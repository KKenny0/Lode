import chalk from 'chalk';

export const VERSION = '0.1.0';

function padRight(str: string, len: number): string {
  // Strip ANSI codes for length calculation
  const visible = str.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, len - visible.length);
  return str + ' '.repeat(pad);
}

export function showLogo(): void {
  const innerWidth = 63;

  // ██ block letters: L O D E
  const letters = [
    '   ██       ██████   ██████   ███████',
    '   ██      ██    ██ ██    ██ ██',
    '   ██      ██    ██ ██    ██ █████',
    '   ██      ██    ██ ██    ██ ██',
    '   ██████   ██████   ██████  ███████',
  ];

  const hLine = '═'.repeat(innerWidth);
  const top    = chalk.cyan(`╔${hLine}╗`);
  const bottom = chalk.cyan(`╚${hLine}╝`);
  const empty  = chalk.cyan('║') + ' '.repeat(innerWidth) + chalk.cyan('║');

  const rows = letters.map(line => {
    const content = chalk.bold.cyan(line);
    return chalk.cyan('║') + padRight(content, innerWidth) + chalk.cyan('║');
  });

  console.log();
  console.log(top);
  console.log(empty);
  rows.forEach(r => console.log(r));
  console.log(empty);
  console.log(bottom);
  console.log();
  console.log(chalk.gray(`  v${VERSION} — 从开发活动中开采值得留下的东西`));
  console.log();
}
