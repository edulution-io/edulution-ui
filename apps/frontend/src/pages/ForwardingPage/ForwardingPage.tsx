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
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import { toast } from 'sonner';
import { getFromPathName } from '@libs/common/utils';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import PageTitle from '@/components/PageTitle';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';
import useUserAccounts from '@/hooks/useUserAccounts';
import RoundArrowIcon from '@/assets/layout/Pfeil.svg?react';

const ForwardingPage: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { language } = useLanguage();

  const [isForwarding, setIsForwarding] = useState(false);
  const [showIsForwarding, setShowIsForwarding] = useState(false);

  const { appConfigs } = useAppConfigsStore();

  const rootPathName = getFromPathName(pathname, 1);
  useUserAccounts(rootPathName);

  useEffect(() => {
    if (isForwarding) {
      setIsForwarding(false);
      const navigateToExternalPage = () => {
        const externalLink = findAppConfigByName(appConfigs, rootPathName)?.options.url;
        if (externalLink) {
          setShowIsForwarding(true);
          return window.open(externalLink, '_blank');
        }
        setShowIsForwarding(false);
        console.error(t('forwardingpage.missing_link'));
        return toast.error(t('forwardingpage.missing_link'));
      };
      navigateToExternalPage();
    }
    setIsForwarding(false);
  }, [isForwarding, rootPathName, appConfigs]);

  const currentAppConfig = findAppConfigByName(appConfigs, rootPathName);

  if (!currentAppConfig) return null;
  const pageTitle = getDisplayName(currentAppConfig, language);

  return (
    <div className="m-auto grid h-[80%] items-center justify-center">
      <PageTitle translationId={pageTitle} />
      <h2 className="text-center text-background">{t('forwardingpage.action')}</h2>
      <div className="mt-20 flex justify-center">
        <RoundArrowIcon
          className="hidden md:flex"
          aria-label={t('forwardingpage.action')}
          width="200px"
        />
        <Button
          type="button"
          variant="btn-hexagon"
          onClick={() => {
            setIsForwarding((prevVal) => !prevVal);
          }}
          hexagonIconAltText={t('common.forward')}
        >
          <img
            className="m-10 w-[200px] md:m-[20] md:w-[200px]"
            src={currentAppConfig.icon}
            alt={currentAppConfig.name}
          />
        </Button>
      </div>
      <h3>{showIsForwarding ? t('forwardingpage.description') : '\u00A0'}</h3>
    </div>
  );
};

export default ForwardingPage;
