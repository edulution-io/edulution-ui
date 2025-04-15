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
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import PageTitle from '@/components/PageTitle';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';
import TApps from '@libs/appconfig/types/appsType';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import useFileTableStore from '../Settings/AppConfig/components/useFileTableStore';

const EmbeddedPage: React.FC = () => {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const { tableContentData, fetchTableContent } = useFileTableStore();

  const { appConfigs } = useAppConfigsStore();

  const rootPathName = getFromPathName(pathname, 1);

  useEffect(() => {
    void fetchTableContent(rootPathName as TApps);
  }, []);

  const currentAppConfig = findAppConfigByName(appConfigs, rootPathName);

  if (!currentAppConfig) return null;
  const pageTitle = getDisplayName(currentAppConfig, language);
  const isSandboxMode = currentAppConfig.extendedOptions?.EMBEDDED_PAGE_HTML_MODE;
  const htmlContentUrl = `${EDU_API_URL}/files/file/${rootPathName}/${tableContentData.find((item) => item.type === 'html')?.filename}`;
  const htmlContent = (currentAppConfig.extendedOptions?.EMBEDDED_PAGE_HTML_CONTENT as string) || '';

  return (
    <>
      <PageTitle translationId={pageTitle} />
      {isSandboxMode ? (
        <iframe
          src={htmlContentUrl}
          title={pageTitle}
          className="h-full w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      ) : (
        <div
          className="h-full w-full"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}
    </>
  );
};

export default EmbeddedPage;
