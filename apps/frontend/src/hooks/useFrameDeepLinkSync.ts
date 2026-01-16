import { useEffect, useRef, useState } from 'react';
import { combineUrlParts, getSubPathFromBrowserUrl } from '@libs/common/utils';
import type UseFrameDeepLinkSyncOptions from '@libs/common/types/useFrameDeepLinkSyncOptions';
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
  const browserUrlSuffix = combineUrlParts(getSubPathFromBrowserUrl(pathname, search, hash, appName));
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
