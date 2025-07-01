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

const getFiles = (dir: string, fileList: string[] = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
};

const normalize = (name: string) => {
  return name.replace(/[-_]/g, '').toLowerCase();
};

const checkFile = (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/export default (?:function|class|const|let|var)?\s*(\w+)/);

  if (match) {
    const exportName = match[1];
    const fileName = path.basename(filePath).split('.')[0];
    if (normalize(fileName) !== normalize(exportName)) {
      console.log(
        chalk.red('Error:'),
        `Filename ${chalk.bold(fileName)} does not match the default export name ${chalk.bold(
          exportName,
        )} in ${chalk.underline(filePath)}`,
      );
      return false;
    }
  }
  return true;
};

const main = () => {
  const appsFiles = getFiles('apps');
  const libsFiles = getFiles('libs');
  const allFiles = [...appsFiles, ...libsFiles];
  let allGood = true;

  allFiles.forEach((file) => {
    if (!checkFile(file)) {
      allGood = false;
    }
  });

  if (allGood) {
    console.log(chalk.green('All filenames match their default exports!'));
  } else {
    process.exit(1);
  }
};

main();
