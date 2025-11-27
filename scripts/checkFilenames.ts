/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const IGNORED_EXTENSIONS = ['.spec.ts', '.mock.ts', '.d.ts'];
const IGNORED_FILENAMES = ['vite.config.ts'];
const IGNORED_PREFIXES = ['migration'];
const ALLOWED_SUFFIXES = ['decorator', 'schema', 'module', 'service', 'enum'];

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

  if (args.length === 0) {
    console.log(chalk.yellow('No files staged for rename-check — skipping.'));
    process.exit(0);
  }

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
