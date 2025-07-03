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

import ts from 'typescript';
import * as fs from 'fs';
import { join, resolve } from 'path';
import chalk from 'chalk';

const errorMessageFilePath = 'libs/src/error/errorMessage.ts';
const localesDir = 'apps/frontend/src/locales/';
const deTranslationFilePath = join(localesDir, 'de/translation.json');
const enTranslationFilePath = join(localesDir, 'en/translation.json');

function readJsonFile(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildJsonKeySet(obj: any, prefix = ''): Set<string> {
  const result = new Set<string>();
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    result.add(full);
    if (value && typeof value === 'object') {
      const subSet = buildJsonKeySet(value, full);
      subSet.forEach((sub) => result.add(sub));
    }
  }
  return result;
}

function getEnumFullPaths(sourceFile: ts.SourceFile): string[] {
  const paths: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isEnumDeclaration(node)) {
      for (const member of node.members) {
        if (member.initializer && ts.isStringLiteral(member.initializer)) {
          paths.push(member.initializer.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return paths;
}

function parseErrorMessageFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const importPaths: string[] = [];
  for (const node of sourceFile.statements) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      importPaths.push(node.moduleSpecifier.text);
    }
  }
  return importPaths.map((importPath) => resolve(importPath.replace('@libs', 'libs/src') + '.ts'));
}

function checkFilePaths(enumImportPaths: string[], keySet: Set<string>) {
  for (const importPath of enumImportPaths) {
    const content = fs.readFileSync(importPath, 'utf-8');
    const sourceFile = ts.createSourceFile(importPath, content, ts.ScriptTarget.Latest, true);
    const enumPaths = getEnumFullPaths(sourceFile);
    for (const path of enumPaths) {
      if (!keySet.has(path)) {
        console.error(`Missing key in JSON: ${path}`);
        process.exit(1);
      }
    }
  }
}

function main() {
  const enumImportPaths = parseErrorMessageFile(errorMessageFilePath);
  const deJson = readJsonFile(deTranslationFilePath);
  const enJson = readJsonFile(enTranslationFilePath);
  const deKeySet = buildJsonKeySet(deJson);
  const enKeySet = buildJsonKeySet(enJson);
  console.log('Checking German translation file...');
  checkFilePaths(enumImportPaths, deKeySet);
  console.log(chalk.green('✔ DE one is awesome!'));
  console.log('Checking English translation file...');
  checkFilePaths(enumImportPaths, enKeySet);
  console.log(chalk.green('✔ EN is awesome!'));
}

main();
