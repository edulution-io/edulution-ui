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

import ExtendedCookieTestResult from '@libs/common/types/cookieTestResult';
import COOKIE_TEST_URL from '@libs/common/constants/cookieTestUrl';

const testCookieAccess = async (): Promise<ExtendedCookieTestResult | null> => {
  try {
    const response = await fetch(COOKIE_TEST_URL, { method: 'HEAD' });
    if (!response.ok) {
      return null;
    }
  } catch (_) {
    return null;
  }

  return new Promise((resolve) => {
    let resolved = false;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = COOKIE_TEST_URL;

    const cleanupAndResolve = (value: ExtendedCookieTestResult | null) => {
      if (!resolved) {
        resolved = true;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        window.removeEventListener('message', handleMessage);
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        resolve(value);
      }
    };

    const handleMessage = (event: MessageEvent<ExtendedCookieTestResult>) => {
      const testUrlOrigin = new URL(COOKIE_TEST_URL).origin;
      if (event.origin !== testUrlOrigin) return;

      if (event.data.cookieTest === 'complete') {
        cleanupAndResolve(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    document.body.appendChild(iframe);

    iframe.onerror = () => {
      cleanupAndResolve(null);
    };
  });
};

export default testCookieAccess;
