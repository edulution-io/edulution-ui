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
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useFileSharingStore from './useFileSharingStore';

const FileSharingRedirect = () => {
  const navigate = useNavigate();
  const { mountPoints, fetchMountPoints } = useFileSharingStore();

  const getValidPath = (mp: DirectoryFileDTO[]) => (mp[0].filename === '/' ? mp[1].filename : mp[0].filename);

  useEffect(() => {
    if (mountPoints.length === 0) {
      const getMountPoints = async () => {
        const newMountPoints = await fetchMountPoints();
        if (newMountPoints.length !== 0) {
          navigate(getValidPath(newMountPoints), { replace: true });
        }
      };
      void getMountPoints();
    } else {
      navigate(getValidPath(mountPoints), { replace: true });
    }
  }, []);

  return null;
};

export default FileSharingRedirect;
