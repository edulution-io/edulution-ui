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

const PREDEFINED_EXTENSIONS = {
  json: { mimeType: 'application/json' },
  yaml: { mimeType: 'text/yaml' },
  yml: { mimeType: 'text/yaml' },
  toml: { mimeType: 'text/plain' },
  xml: { mimeType: 'application/xml' },
  cfg: { mimeType: 'text/plain' },
  ini: { mimeType: 'text/plain' },
  env: { mimeType: 'text/plain' },
  md: { mimeType: 'text/markdown' },
  html: { mimeType: 'text/html' },
  css: { mimeType: 'text/css' },
  csv: { mimeType: 'text/csv' },
  sh: { mimeType: 'application/x-sh' },
  bat: { mimeType: 'application/x-bat' },
  ps1: { mimeType: 'text/plain' },
  py: { mimeType: 'text/x-python' },
  js: { mimeType: 'text/javascript' },
} as const;

type PredefinedExtensionKey = keyof typeof PREDEFINED_EXTENSIONS;

export type { PredefinedExtensionKey };
export default PREDEFINED_EXTENSIONS;
