import * as fs from 'fs';

const loadFile = (path: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path, 'utf8')) as Record<string, unknown>;

const deTranslations = loadFile('./apps/frontend/src/locales/de/translation.json');
const enTranslations = loadFile('./apps/frontend/src/locales/en/translation.json');

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

const missingNestedInEN = deNestedKeys.filter((key) => !enNestedKeys.includes(key));
const missingNestedInDE = enNestedKeys.filter((key) => !deNestedKeys.includes(key));

if (missingNestedInEN.length > 0 || missingNestedInDE.length > 0) {
  console.error('Translation files do not contain the same keys!');

  if (missingNestedInEN.length > 0) {
    console.error(`Missing nested keys in EN translation: ${missingNestedInEN.join(', ')}`);
  }
  if (missingNestedInDE.length > 0) {
    console.error(`Missing nested keys in DE translation: ${missingNestedInDE.join(', ')}`);
  }
  process.exit(1);
} else {
}
