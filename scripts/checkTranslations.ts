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

const loadFile = (path: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path, 'utf8')) as Record<string, unknown>;

const deTranslations = loadFile('./apps/frontend/src/locales/de/translation.json');
const enTranslations = loadFile('./apps/frontend/src/locales/en/translation.json');
const frTranslations = loadFile('./apps/frontend/src/locales/fr/translation.json');

const flattenKeys = (obj: Record<string, unknown>): string[] => {
  const keys: string[] = [];
  const flatten = (object: Record<string, unknown>, path: string[] = []) => {
    Object.keys(object).forEach((key) => {
      if (typeof object[key] === 'object') {
        flatten(object[key] as Record<string, unknown>, [...path, key]);
      } else {
        keys.push([...path, key].join('.'));
      }
    });
  };
  flatten(obj);
  return keys;
};

const enNestedKeys = flattenKeys(enTranslations);
const deNestedKeys = flattenKeys(deTranslations);
const frNestedKeys = flattenKeys(frTranslations);

const missingNestedInEN = deNestedKeys.filter((key) => !enNestedKeys.includes(key));
const missingNestedInDE = enNestedKeys.filter((key) => !deNestedKeys.includes(key));
const missingNestedInFR = deNestedKeys.filter((key) => !frNestedKeys.includes(key));

if (missingNestedInEN.length > 0 || missingNestedInDE.length > 0) {
  console.error('Translation files do not contain the same keys!');

  if (missingNestedInEN.length > 0) {
    console.error(`Missing nested keys in EN translation: ${missingNestedInEN.join(', ')}`);
  }
  if (missingNestedInDE.length > 0) {
    console.error(`Missing nested keys in DE translation: ${missingNestedInDE.join(', ')}`);
  }
  if (missingNestedInFR.length > 0) {
    console.info(`Missing nested keys in FR translation: ${missingNestedInFR.join(', ')}`);
  }
  process.exit(1);
}
