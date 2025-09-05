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
import FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import BackButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/backButton';
import useUserStore from '@/store/UserStore/useUserStore';
import useFileTableStore from '../Settings/AppConfig/components/useFileTableStore';

const PublicEmbeddedPage: React.FC = () => {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { getPublicAppConfig } = useAppConfigsStore();
  const { getPublicFilesInfo } = useFileTableStore();
  const { isAuthenticated } = useUserStore();
  const [currentAppConfig, setCurrentAppConfig] = useState<AppConfigDto>({} as AppConfigDto);
  const [fileInfo, setFileInfo] = useState<FileInfoDto[]>([]);

  const rootPathName = getFromPathName(pathname, 1);

  useEffect(() => {
    const fetchCurrentAppConfig = async () => {
      const appConfig = await getPublicAppConfig(rootPathName);
      const publicFileInfo = await getPublicFilesInfo(rootPathName);
      setCurrentAppConfig(appConfig);
      setFileInfo(publicFileInfo);
    };
    void fetchCurrentAppConfig();
  }, [rootPathName]);

  useEffect(() => {
    if (fileInfo.length > 0 && currentAppConfig.extendedOptions?.EMBEDDED_PAGE_IS_PUBLIC === false) {
      navigate('/');
    }
  }, [fileInfo, currentAppConfig]);

  const pageTitle = getDisplayName(currentAppConfig, language);
  const isSandboxMode = currentAppConfig.extendedOptions?.EMBEDDED_PAGE_HTML_MODE;
  const htmlContentUrl = `${EDU_API_URL}/${EDU_API_CONFIG_ENDPOINTS.FILES}/public/file/${rootPathName}/${fileInfo.find((item) => item.type === 'html')?.filename}`;
  const htmlContent = (currentAppConfig.extendedOptions?.EMBEDDED_PAGE_HTML_CONTENT as string) || '';

  const config: FloatingButtonsBarConfig = {
    buttons: [BackButton(() => navigate('/'))],
    keyPrefix: `${rootPathName}-floating-button_`,
  };

  return (
    <PageLayout>
      {isSandboxMode ? (
        <iframe
          src={htmlContentUrl}
          title={pageTitle}
          className="h-full w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      ) : (
        <div
          className="h-full w-full"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}
      {!isAuthenticated && <FloatingButtonsBar config={config} />}
    </PageLayout>
  );
};

export default PublicEmbeddedPage;
