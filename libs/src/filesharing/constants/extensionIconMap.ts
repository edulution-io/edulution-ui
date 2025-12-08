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
import { SiMarkdown, SiJavascript, SiPython, SiYaml } from 'react-icons/si';
import { FaFileAlt, FaFileCode, FaCog, FaHtml5, FaCss3Alt, FaFileCsv, FaTerminal } from 'react-icons/fa';
import { VscJson } from 'react-icons/vsc';
import { PredefinedExtensionKey } from '@libs/filesharing/constants/predefinedExtensions';

const EXTENSION_ICON_MAP: Record<PredefinedExtensionKey, { icon: IconType; iconColor: string }> = {
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
  bat: { icon: FaTerminal, iconColor: '#4eaa25' },
  ps1: { icon: FaTerminal, iconColor: '#5391fe' },
  py: { icon: SiPython, iconColor: '#3776ab' },
  js: { icon: SiJavascript, iconColor: '#f7df1e' },
};

export default EXTENSION_ICON_MAP;
