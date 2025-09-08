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

import { useEffect, useState } from 'react';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import useLmnApiStore from '@/store/useLmnApiStore';
import getStringFromArray from '@libs/common/utils/getStringFromArray';
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import useLdapGroups from '@/hooks/useLdapGroups';
import type WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import useFileSharingStore from '../useFileSharingStore';

const useUserPath = () => {
  const { webdavShares = [], fetchWebdavShares } = useFileSharingStore();
  const { globalSettings } = useGlobalSettingsApiStore();
  const { user: lmnUser } = useLmnApiStore();
  const { isSuperAdmin = false } = useLdapGroups();

  const [homePath, setHomePath] = useState<string>('');

  const deploymentTarget = globalSettings?.general?.deploymentTarget;
  const intrinsic2 = Array.isArray(lmnUser?.sophomorixIntrinsic2) ? lmnUser.sophomorixIntrinsic2 : [];
  const school = lmnUser?.school ?? '';

  useEffect(() => {
    const isEduFileProxy = (shares?: WebdavShareDto[]) =>
      Array.isArray(shares) && shares[0]?.type === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY;

    const resolveHomePath = async (): Promise<string> => {
      if (!lmnUser) return '';

      if (isSuperAdmin) return '//';

      if (deploymentTarget !== DEPLOYMENT_TARGET.LINUXMUSTER) {
        return getStringFromArray(intrinsic2) ?? '';
      }

      const shares: WebdavShareDto[] =
        webdavShares && webdavShares.length > 0 ? webdavShares : ((await fetchWebdavShares?.()) ?? []);

      if (isEduFileProxy(shares)) {
        const base = getStringFromArray(intrinsic2) ?? '';
        return `${school}/${base}`;
      }

      return getStringFromArray(intrinsic2) ?? '';
    };

    void resolveHomePath().then(setHomePath);
  }, [isSuperAdmin, deploymentTarget, school, JSON.stringify(intrinsic2), webdavShares, fetchWebdavShares, lmnUser]);

  return { homePath };
};

export default useUserPath;
