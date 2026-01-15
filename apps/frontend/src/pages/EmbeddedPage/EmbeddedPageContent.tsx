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

import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type TAppFieldType from '@libs/appconfig/types/tAppFieldType';
import { getProxyPrefixFromUrl } from '@libs/common/utils';
import IFRAME_ALLOWED_CONFIG from '@libs/ui/constants/iframeAllowedConfig';
import useFrameUrlSync from '@/hooks/useFrameUrlSync';

type EmbeddedPageContentProps = {
  appName: string;
  pageTitle: string;
  isSandboxMode?: TAppFieldType;
  htmlContentUrl?: string;
  htmlContent?: string;
  urlSyncEnabled?: boolean;
  preloadBasePage?: boolean;
};

const EmbeddedPageContent: React.FC<EmbeddedPageContentProps> = ({
  appName,
  pageTitle,
  isSandboxMode,
  htmlContentUrl,
  htmlContent,
  urlSyncEnabled = false,
  preloadBasePage = false,
}) => {
  const { pathname, hash } = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const proxyPrefix = getProxyPrefixFromUrl(htmlContentUrl || '');

  const getDeepLinkUrl = (): string | null => {
    const prefix = `/${appName}`;
    if (pathname.startsWith(prefix)) {
      const subPath = pathname.slice(prefix.length);
      if (subPath || hash) {
        return `${proxyPrefix}${subPath}${hash}`;
      }
    }
    return null;
  };

  const deepLinkUrl = !preloadBasePage ? getDeepLinkUrl() : null;

  useFrameUrlSync({
    appName,
    proxyPrefix,
    iframeRef,
    enabled: urlSyncEnabled && !!isSandboxMode,
  });

  if (isSandboxMode) {
    return (
      <iframe
        ref={iframeRef}
        src={deepLinkUrl || htmlContentUrl}
        title={pageTitle}
        className="h-full w-full border-0"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        allow={IFRAME_ALLOWED_CONFIG}
      />
    );
  }

  if (htmlContent) {
    return (
      <div
        className="h-full w-full"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  return null;
};

export default EmbeddedPageContent;
