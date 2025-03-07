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

import { useCallback } from 'react';
import useUserStore from '@/store/UserStore/UserStore';
import { useAuth } from 'react-oidc-context';
import cleanAllStores from '@/store/utils/cleanAllStores';

const useLogout = () => {
  const auth = useAuth();
  const { logout } = useUserStore();

  const handleLogout = useCallback(async () => {
    await logout();
    await auth.removeUser();
    cleanAllStores();
  }, [logout, auth]);

  return handleLogout;
};

export default useLogout;
