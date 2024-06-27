import ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// Paths
const errorMessageFilePath = 'libs/src/error/errorMessage.ts';
const localesDir = 'apps/frontend/src/locales/';
const deTranslationFilePath = path.join(localesDir, 'de/translation.json');
const enTranslationFilePath = path.join(localesDir, 'en/translation.json');

// Helper function to read and parse JSON files
const readJsonFile = (filePath: string) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Helper function to get full enum paths
const getEnumFullPaths = (sourceFile: ts.SourceFile): string[] => {
  const paths: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isEnumDeclaration(node)) {
      node.members.forEach((member) => {
        // Check for string literal initializers
        if (member.initializer && ts.isStringLiteral(member.initializer)) {
          paths.push(member.initializer.text); // Use `.text` to get the string content
        }
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return paths;
};

// Function to parse the TypeScript file and get the imported enums
const parseErrorMessageFile = (filePath: string): string[] => {
  const program = ts.createProgram([filePath], {});
  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) throw new Error(`Source file not found: ${filePath}`);

  const importPaths = [];
  sourceFile.forEachChild((node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      importPaths.push(node.moduleSpecifier.text);
    }
  });

  return importPaths.map((importPath) => path.resolve(importPath.replace('@libs', 'libs/src') + '.ts'));
};

// Function to compare enum full paths with JSON keys
const compareEnumWithJson = (enumPaths: string[], json: any) => {
  enumPaths.forEach((path) => {
    if (!path.split('.').reduce((obj, key) => obj && obj[key], json)) {
      console.error(`Missing key in JSON: ${path}`);
      process.exit(1);
    }
  });
};

// Main function
const main = () => {
  const enumImportPaths = parseErrorMessageFile(errorMessageFilePath);
  const enumPaths = [];

  enumImportPaths.forEach((importPath) => {
    const program = ts.createProgram([importPath], {});
    const sourceFile = program.getSourceFile(importPath);
    if (!sourceFile) throw new Error(`Enum source file not found: ${importPath}`);
    enumPaths.push(...getEnumFullPaths(sourceFile));
  });

  const deJson = readJsonFile(deTranslationFilePath);
  const enJson = readJsonFile(enTranslationFilePath);

  console.log('Checking German translation file...');
  compareEnumWithJson(enumPaths, deJson);

  console.log('✔ DE one is awesome!');

  console.log('Checking English translation file...');
  compareEnumWithJson(enumPaths, enJson);

  console.log('✔ EN is awesome!');
};

main();
