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
import { useAuth } from 'react-oidc-context';
import { useCookies } from 'react-cookie';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/UserStore';
import cleanAllStores from '@/store/utils/cleanAllStores';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';
import { toast } from 'sonner';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';
import COOKIE_DESCRIPTORS from '@libs/common/constants/cookieDescriptors';

const useLogout = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { logout } = useUserStore();
  const [, , removeCookie] = useCookies([COOKIE_DESCRIPTORS.AUTH_TOKEN]);

  const handleLogout = useCallback(async () => {
    await logout();
    await auth.removeUser();
    await cleanAllStores();
    removeCookie(COOKIE_DESCRIPTORS.AUTH_TOKEN, {
      path: DASHBOARD_ROUTE,
    });
    window.history.pushState(null, '', LOGIN_ROUTE);
    window.dispatchEvent(new PopStateEvent('popstate'));
    toast.dismiss();
    if (auth.user?.expired) {
      toast.error(t('auth.errors.TokenExpired'));
    } else {
      toast.success(t('auth.logout.success'), {
        id: 'logout-success',
      });
    }
  }, [auth]);

  return handleLogout;
};

export default useLogout;
