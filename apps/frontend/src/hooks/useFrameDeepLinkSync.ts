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

import { useEffect, useRef, useState } from 'react';
import { combineUrlParts, getSubPathFromBrowserUrl } from '@libs/common/utils';
import type UseFrameDeepLinkSyncOptions from '@libs/frontend/common/types/useFrameDeepLinkSyncOptions';
import useFrameUrlSync from '@/hooks/useFrameUrlSync';

const useFrameDeepLinkSync = ({
  appName,
  iframeRef,
  isFrameLoaded,
  isActiveFrame,
  urlSyncEnabled,
  preloadBasePage,
  pathname,
  search,
  hash,
  getDeepLinkUrl,
}: UseFrameDeepLinkSyncOptions) => {
  const isOnAppRoute = pathname.startsWith(`/${appName}`);
  const browserUrlSuffix = isOnAppRoute
    ? combineUrlParts(getSubPathFromBrowserUrl(pathname, search, hash, appName))
    : null;
  const deepLinkUrl = !preloadBasePage && browserUrlSuffix ? getDeepLinkUrl(browserUrlSuffix) : null;

  const deepLinkRefs = useRef({
    initialBrowserUrlSuffix: browserUrlSuffix,
    hasNavigatedToDeepLink: false,
    iframeSrc: undefined as string | undefined,
  });

  const [hasPendingDeepLink, setHasPendingDeepLink] = useState(
    preloadBasePage && !!deepLinkRefs.current.initialBrowserUrlSuffix,
  );

  useEffect(() => {
    if (!preloadBasePage) {
      setHasPendingDeepLink(false);
      return;
    }

    if (deepLinkRefs.current.initialBrowserUrlSuffix && !deepLinkRefs.current.hasNavigatedToDeepLink) {
      setHasPendingDeepLink(true);
    }
  }, [preloadBasePage]);

  useEffect(() => {
    if (!preloadBasePage || !isFrameLoaded || !isActiveFrame || deepLinkRefs.current.hasNavigatedToDeepLink) {
      return undefined;
    }

    const targetSuffix = deepLinkRefs.current.initialBrowserUrlSuffix;
    if (!targetSuffix) return undefined;

    const iframe = iframeRef.current;
    if (!iframe) return undefined;

    const navigateToDeepLink = () => {
      const targetUrl = getDeepLinkUrl(targetSuffix);
      iframe.src = targetUrl;
      deepLinkRefs.current.iframeSrc = targetUrl;
      deepLinkRefs.current.hasNavigatedToDeepLink = true;
      setHasPendingDeepLink(false);
    };

    const handleLoad = () => {
      setTimeout(navigateToDeepLink, 100);
    };

    iframe.addEventListener('load', handleLoad, { once: true });
    return () => iframe.removeEventListener('load', handleLoad);
  }, [preloadBasePage, isFrameLoaded, isActiveFrame, iframeRef, getDeepLinkUrl]);

  const urlSyncShouldBeEnabled = urlSyncEnabled && isFrameLoaded && isActiveFrame && !hasPendingDeepLink;

  useFrameUrlSync({
    appName,
    iframeRef,
    enabled: urlSyncShouldBeEnabled,
  });

  return { deepLinkRefs, deepLinkUrl };
};

export default useFrameDeepLinkSync;
