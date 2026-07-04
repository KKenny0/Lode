import chalk from 'chalk';

export const VERSION = '0.1.0';

export function showLogo(): void {
  console.log();
  console.log(chalk.bold.cyan('Tracework'));
  console.log(chalk.gray(`v${VERSION} - evidence-backed work memory for agent sessions`));
  console.log();
}
