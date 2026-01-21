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

import { useEffect } from 'react';
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
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  const isOnAppRoute = pathname.startsWith(`/${appName}`);

  useEffect(() => {
    if (!enabled || !isOnAppRoute || !iframeRef.current) return undefined;

    const iframe = iframeRef.current;

    const syncBrowserUrl = () => {
      if (!isSameOrigin(iframe)) return;

      const iframeUrlParts = getSubPathFromIframe(iframe, proxyPrefix);
      if (iframeUrlParts === null) return;

      const browserUrlParts = getSubPathFromBrowserUrl(pathname, search, hash, appName);

      const isDifferent =
        iframeUrlParts.subPath !== browserUrlParts.subPath ||
        iframeUrlParts.search !== browserUrlParts.search ||
        iframeUrlParts.hash !== browserUrlParts.hash;
      if (isDifferent) {
        const newBrowserPath = `/${appName}${iframeUrlParts.subPath}${iframeUrlParts.search}${iframeUrlParts.hash}`;
        navigate(newBrowserPath, { replace: true });
      }
    };

    syncBrowserUrl();

    const intervalId = setInterval(syncBrowserUrl, URL_SYNC_POLLING_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, isOnAppRoute, iframeRef, proxyPrefix, appName, navigate, pathname, search, hash]);
};

export default useFrameUrlSync;
