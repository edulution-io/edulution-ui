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

import {
  faFileLines,
  faFileCode,
  faGear,
  faFileCsv,
  faTerminal,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faDiagramProject,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { faHtml5, faCss3, faPython, faJs, faMarkdown } from '@fortawesome/free-brands-svg-icons';

const EXTENSION_ICON_MAP: Record<string, { icon: IconDefinition; iconColor: string }> = {
  json: { icon: faFileCode, iconColor: '#f5a623' },
  yaml: { icon: faFileCode, iconColor: '#cb171e' },
  yml: { icon: faFileCode, iconColor: '#cb171e' },
  toml: { icon: faFileLines, iconColor: '#9c4121' },
  xml: { icon: faFileCode, iconColor: '#f26522' },
  cfg: { icon: faGear, iconColor: '#848493' },
  ini: { icon: faGear, iconColor: '#848493' },
  env: { icon: faGear, iconColor: '#848493' },
  md: { icon: faMarkdown, iconColor: '#083fa1' },
  html: { icon: faHtml5, iconColor: '#e34f26' },
  css: { icon: faCss3, iconColor: '#1572b6' },
  csv: { icon: faFileCsv, iconColor: '#217346' },
  sh: { icon: faTerminal, iconColor: '#4eaa25' },
  bat: { icon: faTerminal, iconColor: '#c1c12a' },
  ps1: { icon: faTerminal, iconColor: '#5391fe' },
  py: { icon: faPython, iconColor: '#3776ab' },
  js: { icon: faJs, iconColor: '#f7df1e' },
  drawio: { icon: faDiagramProject, iconColor: '#f08705' },
  txt: { icon: faFileLines, iconColor: '#6b7280' },
  docx: { icon: faFileWord, iconColor: '#2b579a' },
  doc: { icon: faFileWord, iconColor: '#2b579a' },
  odt: { icon: faFileWord, iconColor: '#2b579a' },
  dot: { icon: faFileWord, iconColor: '#2b579a' },
  dotx: { icon: faFileWord, iconColor: '#2b579a' },
  ott: { icon: faFileWord, iconColor: '#2b579a' },
  rtf: { icon: faFileWord, iconColor: '#2b579a' },
  xlsx: { icon: faFileExcel, iconColor: '#217346' },
  xls: { icon: faFileExcel, iconColor: '#217346' },
  ods: { icon: faFileExcel, iconColor: '#217346' },
  xlt: { icon: faFileExcel, iconColor: '#217346' },
  xltx: { icon: faFileExcel, iconColor: '#217346' },
  pptx: { icon: faFilePowerpoint, iconColor: '#d24726' },
  ppt: { icon: faFilePowerpoint, iconColor: '#d24726' },
  odp: { icon: faFilePowerpoint, iconColor: '#d24726' },
  pot: { icon: faFilePowerpoint, iconColor: '#d24726' },
  potx: { icon: faFilePowerpoint, iconColor: '#d24726' },
};

export default EXTENSION_ICON_MAP;
