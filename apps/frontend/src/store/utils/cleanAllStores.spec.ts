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

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const STORE_FILE_PATTERN = /^use\w+Store\.tsx?$/;
const FRONTEND_SRC_DIR = path.resolve(__dirname, '../../..');

const findStoreFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.reduce<string[]>((results, entry) => {
    if (entry.isDirectory()) {
      return [...results, ...findStoreFiles(path.join(dir, entry.name))];
    }
    if (STORE_FILE_PATTERN.test(entry.name)) {
      return [...results, entry.name.replace(/\.tsx?$/, '')];
    }
    return results;
  }, []);
};

describe('cleanAllStores validation', () => {
  it('should register all Zustand stores in cleanAllStores', () => {
    const allStoreFileNames = findStoreFiles(FRONTEND_SRC_DIR).sort();
    const cleanAllStoresSource = fs.readFileSync(path.resolve(__dirname, 'cleanAllStores.ts'), 'utf-8');

    const importedFileNames = new Set<string>();
    const importPathRegex = /from\s+['"]([^'"]+)['"]/g;
    let match = importPathRegex.exec(cleanAllStoresSource);
    while (match !== null) {
      const importPath = match[1];
      const baseName = importPath.split('/').pop();
      if (baseName && STORE_FILE_PATTERN.test(`${baseName}.ts`)) {
        importedFileNames.add(baseName);
      }
      match = importPathRegex.exec(cleanAllStoresSource);
    }

    const unregisteredStores = allStoreFileNames.filter((name) => !importedFileNames.has(name));

    expect(
      unregisteredStores,
      `Unregistered stores found. Add these to cleanAllStores.ts:\n${unregisteredStores.join('\n')}`,
    ).toEqual([]);
  });
});
