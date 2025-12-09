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

import { IconType } from 'react-icons';
import { SiMarkdown, SiJavascript, SiPython, SiYaml, SiDiagramsdotnet } from 'react-icons/si';
import {
  FaFileAlt,
  FaFileCode,
  FaCog,
  FaHtml5,
  FaCss3Alt,
  FaFileCsv,
  FaTerminal,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
} from 'react-icons/fa';
import { VscJson } from 'react-icons/vsc';

const EXTENSION_ICON_MAP: Record<string, { icon: IconType; iconColor: string }> = {
  json: { icon: VscJson, iconColor: '#f5a623' },
  yaml: { icon: SiYaml, iconColor: '#cb171e' },
  yml: { icon: SiYaml, iconColor: '#cb171e' },
  toml: { icon: FaFileAlt, iconColor: '#9c4121' },
  xml: { icon: FaFileCode, iconColor: '#f26522' },
  cfg: { icon: FaCog, iconColor: '#848493' },
  ini: { icon: FaCog, iconColor: '#848493' },
  env: { icon: FaCog, iconColor: '#848493' },
  md: { icon: SiMarkdown, iconColor: '#083fa1' },
  html: { icon: FaHtml5, iconColor: '#e34f26' },
  css: { icon: FaCss3Alt, iconColor: '#1572b6' },
  csv: { icon: FaFileCsv, iconColor: '#217346' },
  sh: { icon: FaTerminal, iconColor: '#4eaa25' },
  bat: { icon: FaTerminal, iconColor: '#c1c12a' },
  ps1: { icon: FaTerminal, iconColor: '#5391fe' },
  py: { icon: SiPython, iconColor: '#3776ab' },
  js: { icon: SiJavascript, iconColor: '#f7df1e' },
  drawio: { icon: SiDiagramsdotnet, iconColor: '#f08705' },
  txt: { icon: FaFileAlt, iconColor: '#6b7280' },
  docx: { icon: FaFileWord, iconColor: '#2b579a' },
  doc: { icon: FaFileWord, iconColor: '#2b579a' },
  odt: { icon: FaFileWord, iconColor: '#2b579a' },
  dot: { icon: FaFileWord, iconColor: '#2b579a' },
  dotx: { icon: FaFileWord, iconColor: '#2b579a' },
  ott: { icon: FaFileWord, iconColor: '#2b579a' },
  rtf: { icon: FaFileWord, iconColor: '#2b579a' },
  xlsx: { icon: FaFileExcel, iconColor: '#217346' },
  xls: { icon: FaFileExcel, iconColor: '#217346' },
  ods: { icon: FaFileExcel, iconColor: '#217346' },
  xlt: { icon: FaFileExcel, iconColor: '#217346' },
  xltx: { icon: FaFileExcel, iconColor: '#217346' },
  pptx: { icon: FaFilePowerpoint, iconColor: '#d24726' },
  ppt: { icon: FaFilePowerpoint, iconColor: '#d24726' },
  odp: { icon: FaFilePowerpoint, iconColor: '#d24726' },
  pot: { icon: FaFilePowerpoint, iconColor: '#d24726' },
  potx: { icon: FaFilePowerpoint, iconColor: '#d24726' },
};

export default EXTENSION_ICON_MAP;
