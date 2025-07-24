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

import useLdapGroups from '@/hooks/useLdapGroups';
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import { useLocation } from 'react-router-dom';

const useUserPath = () => {
  const { user: lmnUser } = useLmnApiStore();
  const { isSuperAdmin } = useLdapGroups();
  const { globalSettings } = useGlobalSettingsApiStore();
  const { pathname } = useLocation();

  let homePath: string;
  const fallbackPath = `${pathname.split('/').at(-1)}/`;
  if (globalSettings.general.deploymentTarget === DEPLOYMENT_TARGET.LINUXMUSTER) {
    homePath = isSuperAdmin
      ? `/global/${lmnUser?.sophomorixIntrinsic2[0]}`
      : lmnUser?.sophomorixIntrinsic2[0] || fallbackPath;
  } else {
    homePath = fallbackPath;
  }

  return { homePath };
};

export default useUserPath;
