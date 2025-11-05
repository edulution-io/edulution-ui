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

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFromPathName } from '@libs/common/utils';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import PageLayout from '@/components/structure/layout/PageLayout';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import BackButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/backButton';
import useUserStore from '@/store/UserStore/useUserStore';
import PageTitle from '@/components/PageTitle';
import useFileTableStore from '../Settings/AppConfig/components/useFileTableStore';
import EmbeddedPageContent from './EmbeddedPageContent';

const PublicEmbeddedPage: React.FC = () => {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const getPublicAppConfigByName = useAppConfigsStore((s) => s.getPublicAppConfigByName);
  const getPublicFilesInfo = useFileTableStore((s) => s.getPublicFilesInfo);
  const publicFilesInfo = useFileTableStore((s) => s.publicFilesInfo);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const [currentAppConfig, setCurrentAppConfig] = useState<AppConfigDto>({} as AppConfigDto);

  const rootPathName = getFromPathName(pathname, 1);

  useEffect(() => {
    const fetchCurrentAppConfig = async () => {
      const appConfig = await getPublicAppConfigByName(rootPathName);
      await getPublicFilesInfo(rootPathName);
      setCurrentAppConfig(appConfig);
    };
    void fetchCurrentAppConfig();
  }, [rootPathName]);

  useEffect(() => {
    if (currentAppConfig.extendedOptions?.EMBEDDED_PAGE_IS_PUBLIC === false) {
      navigate('/');
    }
  }, [currentAppConfig]);

  const pageTitle = getDisplayName(currentAppConfig, language);
  const isSandboxMode = currentAppConfig.extendedOptions?.EMBEDDED_PAGE_HTML_MODE;
  const htmlContentUrl = `${EDU_API_URL}/${EDU_API_CONFIG_ENDPOINTS.FILES}/public/file/${rootPathName}/${publicFilesInfo.find((item) => item.type === 'html')?.filename}`;
  const htmlContent = (currentAppConfig.extendedOptions?.EMBEDDED_PAGE_HTML_CONTENT as string) || '';

  const config: FloatingButtonsBarConfig = {
    buttons: [BackButton(() => navigate('/'))],
    keyPrefix: `${rootPathName}-floating-button_`,
  };

  return (
    <PageLayout isFullScreen>
      <PageTitle
        title={pageTitle}
        translationId="public"
      />
      <EmbeddedPageContent
        pageTitle={pageTitle}
        isSandboxMode={isSandboxMode}
        htmlContentUrl={htmlContentUrl}
        htmlContent={htmlContent}
      />
      {!isAuthenticated && <FloatingButtonsBar config={config} />}
    </PageLayout>
  );
};

export default PublicEmbeddedPage;
