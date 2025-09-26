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

import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import useLdapGroups from '@/hooks/useLdapGroups';
import useLmnApiStore from '@/store/useLmnApiStore';
import getUserAttributValue from '@libs/lmnApi/utils/getUserAttributValue';

const useVariableSharePathname = () => {
  const { isSuperAdmin } = useLdapGroups();
  const { isLmn } = useDeploymentTarget();
  const lmnUser = useLmnApiStore((state) => state.user);
  const createVariableSharePathname = (pathname: string, variable?: string) => {
    if (!isSuperAdmin && isLmn) {
      return `${pathname}${getUserAttributValue(lmnUser, variable)}`;
    }
    return pathname;
  };

  return { createVariableSharePathname };
};

export default useVariableSharePathname;
