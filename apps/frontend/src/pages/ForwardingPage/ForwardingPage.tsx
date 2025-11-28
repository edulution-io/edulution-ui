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

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/shared/Button';
import PageTitle from '@/components/PageTitle';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useLanguage from '@/hooks/useLanguage';
import useUserAccounts from '@/hooks/useUserAccounts';
import { getFromPathName } from '@libs/common/utils';
import findAppConfigByName from '@libs/common/utils/findAppConfigByName';
import getDisplayName from '@/utils/getDisplayName';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import RoundArrowIcon from '@/assets/layout/Pfeil.svg?react';

const ForwardingPage = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const { appConfigs } = useAppConfigsStore();

  const [hasForwarded, setHasForwarded] = useState(false);
  const hasAutoForwardedRef = useRef(false);

  const rootPathName = getFromPathName(pathname, 1);
  useUserAccounts(rootPathName);

  const currentAppConfig = findAppConfigByName(appConfigs, rootPathName);

  const openExternalLink = () => {
    if (!currentAppConfig?.options.url) {
      console.error(t('forwardingpage.missing_link'));
      toast.error(t('forwardingpage.missing_link'));
      return;
    }

    window.open(currentAppConfig.options.url, '_blank');
    setHasForwarded(true);
  };

  useEffect(() => {
    if (!currentAppConfig || hasAutoForwardedRef.current) return;

    const shouldForwardDirectly = !!currentAppConfig.extendedOptions?.[ExtendedOptionKeys.FORWARDING_FORWARD_DIRECTLY];

    if (shouldForwardDirectly) {
      hasAutoForwardedRef.current = true;
      openExternalLink();
    }
  }, [currentAppConfig]);

  if (!currentAppConfig) return null;

  const pageTitle = getDisplayName(currentAppConfig, language);
  const shouldForwardDirectly = !!currentAppConfig.extendedOptions?.[ExtendedOptionKeys.FORWARDING_FORWARD_DIRECTLY];

  const targetUrl = currentAppConfig?.options?.url;

  return (
    <div
      className="m-auto grid h-[80%] items-center justify-center"
      data-forwarding-page="true"
      data-target-url={targetUrl}
    >
      <PageTitle translationId={pageTitle} />
      <h1 className="text-center text-background">{t('forwardingpage.action')}</h1>
      <div className="mt-20 flex justify-center">
        <RoundArrowIcon
          className="hidden md:flex"
          aria-label={t('forwardingpage.action')}
          width="200px"
        />
        <Button
          type="button"
          variant="btn-hexagon"
          onClick={openExternalLink}
          hexagonIconAltText={t('common.forward')}
          data-target-url={targetUrl}
        >
          <img
            className="m-10 w-[200px] md:m-[20] md:w-[200px]"
            src={currentAppConfig.icon}
            alt={currentAppConfig.name}
          />
        </Button>
      </div>
      <h2 className="text-center">
        {hasForwarded || shouldForwardDirectly ? t('forwardingpage.description') : '\u00A0'}
      </h2>
    </div>
  );
};

export default ForwardingPage;
