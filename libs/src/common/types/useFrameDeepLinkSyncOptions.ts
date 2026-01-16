import type { RefObject } from 'react';

type UseFrameDeepLinkSyncOptions = {
  appName: string;
  iframeRef: RefObject<HTMLIFrameElement>;
  isFrameLoaded: boolean;
  isActiveFrame: boolean;
  urlSyncEnabled: boolean;
  preloadBasePage: boolean;
  pathname: string;
  search: string;
  hash: string;
  getDeepLinkUrl: (browserUrlSuffix: string) => string;
};

export default UseFrameDeepLinkSyncOptions;
