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

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SHARED from '@libs/filesharing/constants/shared';
import useFileSharingStore from './useFileSharingStore';

const FileSharingRedirect = () => {
  const navigate = useNavigate();
  const { webdavShares, fetchWebdavShares } = useFileSharingStore();

  useEffect(() => {
    if (webdavShares.length === 0) {
      const getWebdavShares = async () => {
        const newWebdavShares = await fetchWebdavShares();
        if (newWebdavShares.length !== 0) {
          const target = newWebdavShares ? newWebdavShares[0].displayName : SHARED;
          navigate(target, { replace: true });
        }
      };
      void getWebdavShares();
    } else {
      navigate(`${webdavShares[0].displayName}`, { replace: true });
    }
  }, []);

  return null;
};

export default FileSharingRedirect;
