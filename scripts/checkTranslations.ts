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
