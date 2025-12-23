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

const TEXT_EXTENSIONS = {
  TXT: 'txt',
  LOG: 'log',
  MD: 'md',
  MARKDOWN: 'markdown',
  JSON: 'json',
  XML: 'xml',
  YAML: 'yaml',
  YML: 'yml',
  TOML: 'toml',
  HTML: 'html',
  HTM: 'htm',
  CSS: 'css',
  SCSS: 'scss',
  SASS: 'sass',
  LESS: 'less',
  JS: 'js',
  JSX: 'jsx',
  TS: 'ts',
  TSX: 'tsx',
  MJS: 'mjs',
  CJS: 'cjs',
  VUE: 'vue',
  SVELTE: 'svelte',
  PY: 'py',
  PYX: 'pyx',
  RB: 'rb',
  PHP: 'php',
  JAVA: 'java',
  KT: 'kt',
  SCALA: 'scala',
  C: 'c',
  H: 'h',
  CPP: 'cpp',
  HPP: 'hpp',
  CC: 'cc',
  CXX: 'cxx',
  CS: 'cs',
  GO: 'go',
  RS: 'rs',
  SWIFT: 'swift',
  R: 'r',
  SQL: 'sql',
  SH: 'sh',
  BASH: 'bash',
  ZSH: 'zsh',
  FISH: 'fish',
  PS1: 'ps1',
  BAT: 'bat',
  CMD: 'cmd',
  CFG: 'cfg',
  CONF: 'conf',
  CONFIG: 'config',
  INI: 'ini',
  ENV: 'env',
  PROPERTIES: 'properties',
  CSV: 'csv',
  TSV: 'tsv',
  SVG: 'svg',
  DOCKERFILE: 'dockerfile',
  MAKEFILE: 'makefile',
  GITIGNORE: 'gitignore',
  GITATTRIBUTES: 'gitattributes',
  EDITORCONFIG: 'editorconfig',
  ESLINTRC: 'eslintrc',
  PRETTIERRC: 'prettierrc',
  BABELRC: 'babelrc',
  NPMRC: 'npmrc',
  NVMRC: 'nvmrc',
  HTACCESS: 'htaccess',
  TEX: 'tex',
  BIB: 'bib',
  RST: 'rst',
  ASCIIDOC: 'asciidoc',
  ADOC: 'adoc',
  GRADLE: 'gradle',
  SBT: 'sbt',
  CMAKE: 'cmake',
  LOCK: 'lock',
} as const;

type TextExtension = (typeof TEXT_EXTENSIONS)[keyof typeof TEXT_EXTENSIONS];

export type { TextExtension };
export default TEXT_EXTENSIONS;
