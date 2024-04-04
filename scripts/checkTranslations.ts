import * as fs from 'fs';

const loadFile = (path: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path, 'utf8')) as Record<string, unknown>;

const deTranslations = loadFile('./apps/frontend/src/locales/de/translation.json');
const enTranslations = loadFile('./apps/frontend/src/locales/en/translation.json');

const enKeys = Object.keys(enTranslations).sort();
const deKeys = Object.keys(deTranslations).sort();

const missingInEN = deKeys.filter((key) => !enKeys.includes(key));
const missingInDE = enKeys.filter((key) => !deKeys.includes(key));

if (missingInEN.length > 0 || missingInDE.length > 0) {
  console.error('Translation files do not contain the same keys!');

  if (missingInEN.length > 0) {
    console.error(`Missing in EN translation: ${missingInEN.join(', ')}`);
  }
  if (missingInDE.length > 0) {
    console.error(`Missing in DE translation: ${missingInDE.join(', ')}`);
  }
  process.exit(1);
}
