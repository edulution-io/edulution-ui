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

import React from 'react';
import { useLocation } from 'react-router-dom';
import { getFromPathName } from '@libs/common/utils';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import PageTitle from '@/components/PageTitle';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';

const EmbeddedPage: React.FC = () => {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  const { appConfigs } = useAppConfigsStore();

  const rootPathName = getFromPathName(pathname, 1);

  const currentAppConfig = findAppConfigByName(appConfigs, rootPathName);

  if (!currentAppConfig) return null;
  const pageTitle = getDisplayName(currentAppConfig, language);
  const isSandboxMode = currentAppConfig.extendedOptions?.EMBEDDED_PAGE_HTML_MODE;

  return (
    <>
      <PageTitle translationId={pageTitle} />
      {isSandboxMode ? (
        <iframe
          src={(currentAppConfig.extendedOptions?.EMBEDDED_PAGE_HTML_CONTENT as string) || ''}
          title={pageTitle}
          className="h-full w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      ) : (
        <div
          className="h-full w-full"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: currentAppConfig.extendedOptions?.EMBEDDED_PAGE_HTML_CONTENT as string }}
        />
      )}
    </>
  );
};

export default EmbeddedPage;
