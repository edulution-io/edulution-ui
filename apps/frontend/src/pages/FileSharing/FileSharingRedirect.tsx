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

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import SHARED from '@libs/filesharing/constants/shared';
import useLmnApiStore from '@/store/useLmnApiStore';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import useFileSharingStore from './useFileSharingStore';
import useVariableSharePathname from './hooks/useVariableSharePathname';

const FileSharingRedirect = () => {
  const navigate = useNavigate();
  const { webdavShares, fetchWebdavShares } = useFileSharingStore();
  const { createVariableSharePathname } = useVariableSharePathname();
  const hasNavigatedRef = useRef(false);
  const globalSettings = useGlobalSettingsApiStore((s) => s.globalSettings);
  const { isLmn } = useDeploymentTarget();
  const lmnUser = useLmnApiStore((s) => s.user);
  const lmnApiToken = useLmnApiStore((s) => s.lmnApiToken);
  const isGetOwnUserLoading = useLmnApiStore((s) => s.isGetOwnUserLoading);
  const isLoading = useLmnApiStore((s) => s.isLoading);

  useEffect(() => {
    if (webdavShares.length === 0) {
      void fetchWebdavShares();
    }
  }, [fetchWebdavShares, webdavShares.length]);

  useEffect(() => {
    if (hasNavigatedRef.current) return;
    if (webdavShares.length === 0) return;
    if (!globalSettings) return;
    if (isLmn && (!lmnApiToken || !lmnUser || isLoading || isGetOwnUserLoading)) return;

    const shares = webdavShares.filter((share) => !share.isRootServer);
    hasNavigatedRef.current = true;

    if (shares.length > 0) {
      const navigationPath = createVariableSharePathname(shares[0].pathname, shares[0].pathVariables);
      navigate(
        {
          pathname: `/${APPS.FILE_SHARING}/${shares[0].displayName}`,
          search: `?${URL_SEARCH_PARAMS.PATH}=${encodeURIComponent(navigationPath)}`,
        },
        { replace: true },
      );
    } else {
      navigate(
        {
          pathname: `/${APPS.FILE_SHARING}/${SHARED}`,
        },
        { replace: true },
      );
    }
  }, [
    navigate,
    webdavShares,
    createVariableSharePathname,
    isLmn,
    lmnUser,
    lmnApiToken,
    isLoading,
    isGetOwnUserLoading,
    globalSettings,
  ]);

  return <div />;
};

export default FileSharingRedirect;
