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

import BROWSER_DOWNLOAD_HELP_URLS, {
  BROWSER_USER_AGENT_IDENTIFIERS,
} from '@libs/common/constants/browserDownloadHelpUrls';

type BrowserType = keyof typeof BROWSER_DOWNLOAD_HELP_URLS;

const detectBrowser = (): BrowserType => {
  if (typeof window === 'undefined' || !navigator?.userAgent) {
    return 'default';
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes(BROWSER_USER_AGENT_IDENTIFIERS.edge)) {
    return BROWSER_USER_AGENT_IDENTIFIERS.edge;
  }
  if (
    userAgent.includes(BROWSER_USER_AGENT_IDENTIFIERS.chrome) &&
    !userAgent.includes(BROWSER_USER_AGENT_IDENTIFIERS.edge)
  ) {
    return BROWSER_USER_AGENT_IDENTIFIERS.chrome;
  }
  if (userAgent.includes(BROWSER_USER_AGENT_IDENTIFIERS.firefox)) {
    return BROWSER_USER_AGENT_IDENTIFIERS.firefox;
  }
  if (
    userAgent.includes(BROWSER_USER_AGENT_IDENTIFIERS.safari) &&
    !userAgent.includes(BROWSER_USER_AGENT_IDENTIFIERS.chrome)
  ) {
    return BROWSER_USER_AGENT_IDENTIFIERS.safari;
  }

  return 'default';
};

const getBrowserDownloadHelpUrl = (): string => {
  const browser = detectBrowser();
  return BROWSER_DOWNLOAD_HELP_URLS[browser];
};

export default getBrowserDownloadHelpUrl;
