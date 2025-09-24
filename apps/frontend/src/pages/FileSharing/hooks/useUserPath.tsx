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
import useLdapGroups from '@/hooks/useLdapGroups';

const useUserPath = () => {
  const { globalSettings } = useGlobalSettingsApiStore();
  const { user: lmnUser } = useLmnApiStore();
  const { isSuperAdmin } = useLdapGroups();

  const [homePath, setHomePath] = useState<string>('');

  useEffect(() => {
    if (isSuperAdmin || globalSettings.general.deploymentTarget !== DEPLOYMENT_TARGET.LINUXMUSTER) {
      setHomePath('/');
    } else setHomePath(getStringFromArray(lmnUser?.sophomorixIntrinsic2));
  }, [isSuperAdmin, globalSettings.general.deploymentTarget, lmnUser]);

  return { homePath };
};

export default useUserPath;
