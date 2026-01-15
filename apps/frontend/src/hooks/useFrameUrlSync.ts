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

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import URL_SYNC_POLLING_INTERVAL_MS from '@libs/common/constants/urlSyncPollingIntervalMs';
import { getSubPathFromBrowserUrl, getSubPathFromIframe, isSameOrigin } from '@libs/common/utils';

interface UseFrameUrlSyncOptions {
  appName: string;
  proxyPrefix?: string;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  enabled: boolean;
}

const useFrameUrlSync = ({ appName, proxyPrefix, iframeRef, enabled }: UseFrameUrlSyncOptions) => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  const isOnAppRoute = pathname.startsWith(`/${appName}`);

  const pathnameRef = useRef(pathname);
  const hashRef = useRef(hash);
  const navigateRef = useRef(navigate);

  pathnameRef.current = pathname;
  hashRef.current = hash;
  navigateRef.current = navigate;

  useEffect(() => {
    if (!enabled || !isOnAppRoute || !iframeRef.current) return undefined;

    const iframe = iframeRef.current;

    const syncBrowserUrl = () => {
      if (!isSameOrigin(iframe)) return;

      const iframeUrlParts = getSubPathFromIframe(iframe, proxyPrefix);
      if (iframeUrlParts === null) return;

      const browserUrlParts = getSubPathFromBrowserUrl(pathnameRef.current, hashRef.current, appName);

      if (iframeUrlParts.subPath !== browserUrlParts.subPath || iframeUrlParts.hash !== browserUrlParts.hash) {
        const newBrowserPath = `/${appName}${iframeUrlParts.subPath}${iframeUrlParts.hash}`;
        navigateRef.current(newBrowserPath, { replace: true });
      }
    };

    syncBrowserUrl();

    const intervalId = setInterval(syncBrowserUrl, URL_SYNC_POLLING_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, isOnAppRoute, iframeRef, proxyPrefix, appName]);
};

export default useFrameUrlSync;
