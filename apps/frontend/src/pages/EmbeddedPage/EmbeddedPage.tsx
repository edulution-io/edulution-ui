/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
    <PageLayout isFullScreenAppWithoutFloatingButtons>
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
