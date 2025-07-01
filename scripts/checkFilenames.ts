/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const IGNORED_EXTENSIONS = ['.spec.ts', '.mock.ts', '.d.ts'];
const IGNORED_FILENAMES = ['vite.config.ts'];
const IGNORED_PREFIXES = ['migration'];
const ALLOWED_SUFFIXES = ['decorator', 'schema', 'module', 'service'];

function getFiles(dir: string, fileList: string[] = []): string[] {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function normalize(name: string): string {
  return name.replace(/[-_.]/g, '').toLowerCase();
}

function checkFile(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return true;
  }
  const basename = path.basename(filePath);
  if (
    IGNORED_EXTENSIONS.some((ext) => basename.endsWith(ext)) ||
    IGNORED_FILENAMES.includes(basename) ||
    IGNORED_PREFIXES.some((prefix) => basename.startsWith(prefix))
  ) {
    return true;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/export default\s+(?:abstract\s+)?(?:function|class|const|let|var|interface)?\s*(\w+)/);
  if (!match) {
    return true;
  }

  const exportName = match[1];
  const fileName = path.basename(filePath, path.extname(filePath));
  const normExport = normalize(exportName);
  const normFile = normalize(fileName);

  const directMatch = normFile === normExport;
  const suffixMatch = ALLOWED_SUFFIXES.some((suffix) => {
    const normSuffix = normalize(suffix);
    return normFile === normExport + normSuffix;
  });

  if (directMatch || suffixMatch) {
    return true;
  }

  console.log(
    chalk.red('Error:'),
    `Filename ${chalk.bold(fileName)} does not match the default export name ${chalk.bold(exportName)} in ${chalk.underline(filePath)}`,
  );
  return false;
}

function main(): void {
  const args = process.argv.slice(2);
  const allFiles = args.length
    ? args.filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'))
    : [...getFiles('apps'), ...getFiles('libs')];

  let allGood = true;
  for (const file of allFiles) {
    if (!checkFile(file)) {
      allGood = false;
    }
  }

  if (allGood) {
    console.log(chalk.green('All filenames match their default exports!'));
  } else {
    process.exit(1);
  }
}

main();
