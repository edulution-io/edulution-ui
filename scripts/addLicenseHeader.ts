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

import { readFileSync, writeFileSync, readdirSync, lstatSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const licenseText = `/*
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
 */`;

const targetDirectories = ['apps', 'libs', 'scripts'];
const excludedPatterns = [/\.config\.ts$/, /\.config\.js$/];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

const hasLicenseHeader = (fileContent: string) => {
  return fileContent.includes('info@netzint.de');
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
