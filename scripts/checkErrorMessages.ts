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

import ts from 'typescript';
import * as fs from 'fs';
import { join, resolve } from 'path';
import chalk from 'chalk';

const errorMessageFilePath = 'libs/src/error/errorMessage.ts';
const localesDir = 'apps/frontend/src/locales/';
const deTranslationFilePath = join(localesDir, 'de/translation.json');
const enTranslationFilePath = join(localesDir, 'en/translation.json');

const readJsonFile = (filePath: string) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const buildJsonKeySet = (obj: any, prefix = ''): Set<string> => {
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
};

const getEnumFullPaths = (sourceFile: ts.SourceFile): string[] => {
  const paths: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isEnumDeclaration(node)) {
      for (const member of node.members) {
        if (member.initializer && ts.isStringLiteral(member.initializer)) {
          paths.push(member.initializer.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return paths;
};

const parseErrorMessageFile = (filePath: string): string[] => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const importPaths: string[] = [];
  for (const node of sourceFile.statements) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      importPaths.push(node.moduleSpecifier.text);
    }
  }
  return importPaths.map((importPath) => resolve(importPath.replace('@libs', 'libs/src') + '.ts'));
};

const checkFilePaths = (enumImportPaths: string[], keySet: Set<string>) => {
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
};

const main = () => {
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
};

main();
