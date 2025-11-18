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

import APPS from '@libs/appconfig/constants/apps';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import useVariableSharePathname from './useVariableSharePathname';

const useBreadcrumbNavigation = (
  webdavShare: string | undefined,
  webdavShares: WebdavShareDto[],
  searchParams: URLSearchParams,
  setSearchParams: (params: URLSearchParams) => void,
) => {
  const navigate = useNavigate();
  const { createVariableSharePathname } = useVariableSharePathname();
  const { isLmn } = useDeploymentTarget();

  const currentShare = useMemo(
    () => webdavShares.find((s) => s.displayName === webdavShare),
    [webdavShare, webdavShares],
  );

  const hiddenSegments = currentShare?.pathname;

  const handleBreadcrumbNavigate = (filenamePath: string) => {
    if (!currentShare) return;

    if (filenamePath === '/') {
      let currentSharePath = currentShare.pathname;
      if (currentShare.pathVariables) {
        currentSharePath = createVariableSharePathname(currentSharePath, currentShare.pathVariables, isLmn);
      }

      navigate(
        {
          pathname: `/${APPS.FILE_SHARING}/${currentShare.displayName}`,
          search: `?${URL_SEARCH_PARAMS.PATH}=${encodeURIComponent(currentSharePath)}`,
        },
        { replace: true },
      );
      return;
    }

    const newParams = new URLSearchParams(searchParams);
    newParams.set(URL_SEARCH_PARAMS.PATH, filenamePath);
    setSearchParams(newParams);
  };

  return { handleBreadcrumbNavigate, hiddenSegments };
};

export default useBreadcrumbNavigation;
