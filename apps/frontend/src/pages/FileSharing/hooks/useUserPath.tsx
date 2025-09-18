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
  const { webdavShares, fetchWebdavShares } = useFileSharingStore();
  const { globalSettings } = useGlobalSettingsApiStore();
  const { user: lmnUser } = useLmnApiStore();
  const { isSuperAdmin } = useLdapGroups();

  const [homePath, setHomePath] = useState<string>('');

  useEffect(() => {
    const isEduFileProxy = (shares: WebdavShareDto[]) => shares[0]?.type === WEBDAV_SHARE_TYPE.EDU_FILE_PROXY;

    const resolveHomePath = async (): Promise<string> => {
      if (isSuperAdmin) return '//';

      if (globalSettings.general.deploymentTarget !== DEPLOYMENT_TARGET.LINUXMUSTER) {
        return getStringFromArray(lmnUser?.sophomorixIntrinsic2);
      }

      const shares = webdavShares.length > 0 ? webdavShares : await fetchWebdavShares();
      if (isEduFileProxy(shares)) {
        return `${lmnUser?.school ?? ''}/${getStringFromArray(lmnUser?.sophomorixIntrinsic2)}`;
      }

      return getStringFromArray(lmnUser?.sophomorixIntrinsic2);
    };

    void resolveHomePath().then(setHomePath);
  }, [isSuperAdmin, globalSettings.general.deploymentTarget, lmnUser, webdavShares.length]);

  return { homePath };
};

export default useUserPath;
