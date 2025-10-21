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

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import SHARED from '@libs/filesharing/constants/shared';
import useFileSharingStore from './useFileSharingStore';
import useVariableSharePathname from './hooks/useVariableSharePathname';

const FileSharingRedirect = () => {
  const navigate = useNavigate();
  const { webdavShares, fetchWebdavShares } = useFileSharingStore();
  const { createVariableSharePathname } = useVariableSharePathname();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current)
      navigate(
        {
          pathname: `/${APPS.FILE_SHARING}/${SHARED}`,
        },
        { replace: true },
      );
    const ensureShares = async () => {
      let shares = webdavShares.filter((share) => !share.isRootServer);

      if (shares.length === 0) {
        shares = await fetchWebdavShares();
        hasRunRef.current = true;
      }

      if (shares.length > 0) {
        const navigationPath = createVariableSharePathname(shares[0].pathname, shares[0].pathVariables);
        navigate(
          {
            pathname: `/${APPS.FILE_SHARING}/${shares[0].displayName}`,
            search: `?${URL_SEARCH_PARAMS.PATH}=${encodeURIComponent(navigationPath)}`,
          },
          { replace: true },
        );
      }
    };

    void ensureShares();
  }, [navigate, webdavShares, fetchWebdavShares]);

  return <div />;
};

export default FileSharingRedirect;
