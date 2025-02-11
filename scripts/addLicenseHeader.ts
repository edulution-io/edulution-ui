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

import { readFileSync, writeFileSync, readdirSync, lstatSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const licenseText = `/*
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
`;

const targetDirectories = ['apps', 'libs', 'scripts'];
const excludedPatterns = [/\.config\.ts$/, /\.config\.js$/, /\/excalidraw-assets\//];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

const hasLicenseHeader = (fileContent: string) => {
  return fileContent.includes('GNU Affero General Public License');
};

const addLicenseHeader = (filePath: string) => {
  const fileContent = readFileSync(filePath, 'utf8');
  if (!hasLicenseHeader(fileContent)) {
    const newContent = licenseText + '\n' + fileContent;
    writeFileSync(filePath, newContent, 'utf8');
    console.log(`License header added: ${filePath}`);
  }
};

const isExcluded = (filePath: string) => {
  return excludedPatterns.some((pattern) => pattern.test(filePath));
};

const processDirectory = (directory: string) => {
  readdirSync(directory).forEach((file) => {
    const fullPath = join(directory, file);
    if (lstatSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else {
      if (fileExtensions.some((ext) => fullPath.endsWith(ext)) && !isExcluded(fullPath)) {
        addLicenseHeader(fullPath);
      }
    }
  });
};

targetDirectories.forEach((dir) => {
  const fullPath = resolve(__dirname, '..', dir);
  if (existsSync(fullPath)) {
    processDirectory(fullPath);
  } else {
    console.warn(`Directory not found: ${fullPath}`);
  }
});
