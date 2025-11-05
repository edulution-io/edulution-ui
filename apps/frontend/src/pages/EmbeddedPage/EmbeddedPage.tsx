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

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getFromPathName } from '@libs/common/utils';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';
import TApps from '@libs/appconfig/types/appsType';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import PageLayout from '@/components/structure/layout/PageLayout';
import useUserAccounts from '@/hooks/useUserAccounts';
import useFileTableStore from '../Settings/AppConfig/components/useFileTableStore';
import EmbeddedPageContent from './EmbeddedPageContent';

const EmbeddedPage: React.FC = () => {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const { tableContentData, fetchTableContent } = useFileTableStore();

  const { appConfigs } = useAppConfigsStore();

  const rootPathName = getFromPathName(pathname, 1);

  useUserAccounts(rootPathName);

  useEffect(() => {
    void fetchTableContent(rootPathName as TApps);
  }, [rootPathName]);

  const currentAppConfig = findAppConfigByName(appConfigs, rootPathName);

  if (!currentAppConfig) return null;
  const pageTitle = getDisplayName(currentAppConfig, language);
  const isSandboxMode = currentAppConfig.extendedOptions?.EMBEDDED_PAGE_HTML_MODE;
  const htmlContentUrl = `${EDU_API_URL}/${EDU_API_CONFIG_ENDPOINTS.FILES}/file/${rootPathName}/${tableContentData.find((item) => item.type === 'html')?.filename}`;
  const htmlContent = (currentAppConfig.extendedOptions?.EMBEDDED_PAGE_HTML_CONTENT as string) || '';

  return (
    <PageLayout isFullScreen>
      <EmbeddedPageContent
        pageTitle={pageTitle}
        isSandboxMode={isSandboxMode}
        htmlContentUrl={htmlContentUrl}
        htmlContent={htmlContent}
      />
    </PageLayout>
  );
};

export default EmbeddedPage;
