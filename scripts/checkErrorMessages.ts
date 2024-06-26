import ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// Paths
const errorMessageFilePath = 'libs/src/error/errorMessage.ts';
const localesDir = 'apps/frontend/src/locales/';
const deTranslationFilePath = path.join(localesDir, 'de/translation.json');
const enTranslationFilePath = path.join(localesDir, 'en/translation.json');

// Helper function to read and parse JSON files
const readJsonFile = (filePath: string) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Helper function to get all enum keys
const getEnumKeys = (sourceFile: ts.SourceFile): string[] => {
  const keys: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isEnumDeclaration(node)) {
      node.members.forEach((member: ts.EnumMember) => {
        if (ts.isEnumMember(member) && member.name && ts.isIdentifier(member.name)) {
          keys.push(member.name.text);
        }
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return keys;
};

// Function to resolve @libs to libs/src in import paths
const resolveImportPath = (importPath: string) => {
  return importPath.replace('@libs', 'libs/src');
};

// Function to parse the TypeScript file and get the imported enums
const parseErrorMessageFile = (filePath: string): string[] => {
  const program = ts.createProgram([filePath], {});
  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) {
    throw new Error(`Source file not found: ${filePath}`);
  }

  const importPaths: string[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      importPaths.push(node.moduleSpecifier.text);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return importPaths.map(resolveImportPath);
};

// Function to compare enum keys with JSON keys
const compareEnumWithJson = (enumKeys: string[], json: any, prefix: string) => {
  enumKeys.forEach((key) => {
    const fullKey = `${prefix}.${key}`;
    if (!fullKey.split('.').reduce((o, k) => (o || {})[k], json)) {
      console.error(`Missing key in JSON: ${fullKey}`);
      process.exit(1);
    }
  });
};

// Main function
const main = () => {
  const enumImportPaths = parseErrorMessageFile(errorMessageFilePath);
  const enumKeys: string[] = [];

  enumImportPaths.forEach((importPath) => {
    const absolutePath = path.resolve(importPath + '.ts');
    const program = ts.createProgram([absolutePath], {});
    const sourceFile = program.getSourceFile(absolutePath);
    if (!sourceFile) {
      throw new Error(`Enum source file not found: ${absolutePath}`);
    }
    enumKeys.push(...getEnumKeys(sourceFile));
  });

  const deJson = readJsonFile(deTranslationFilePath);
  const enJson = readJsonFile(enTranslationFilePath);

  console.log('Checking German translation file...');
  compareEnumWithJson(enumKeys, deJson, 'conferences.errors');

  console.log('Checking English translation file...');
  compareEnumWithJson(enumKeys, enJson, 'conferences.errors');
};

main();
