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

import { useLocation } from 'react-router-dom';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import useLmnApiStore from '@/store/useLmnApiStore';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import getStringFromArray from '@libs/common/utils/getStringFromArray';
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import useFileSharingStore from '../useFileSharingStore';

const useUserPath = () => {
  const { mountPoints, webdavShares } = useFileSharingStore();
  const { globalSettings } = useGlobalSettingsApiStore();
  const { pathname } = useLocation();
  const { user: lmnUser } = useLmnApiStore();

  let homePath: string;
  const fallbackPath = `${pathname.split('/').at(-1)}/`;
  if (globalSettings.general.deploymentTarget === DEPLOYMENT_TARGET.LINUXMUSTER) {
    const getFallbackPath = () => {
      const filtered = mountPoints.filter((mp) => mp.filename === fallbackPath.split('/').at(-1));

      if (filtered.length !== 0) {
        return getPathWithoutWebdav(filtered[0]?.filePath);
      }

      if (webdavShares[0].type === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY) {
        return `/${fallbackPath}${getStringFromArray(lmnUser?.sophomorixIntrinsic2)}`;
      }

      return getStringFromArray(lmnUser?.sophomorixIntrinsic2);
    };

    homePath = getFallbackPath();
  } else {
    homePath = fallbackPath;
  }

  return { homePath };
};

export default useUserPath;
