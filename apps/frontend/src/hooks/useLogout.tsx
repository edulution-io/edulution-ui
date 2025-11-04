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
import useUserStore from '@/store/UserStore/useUserStore';
import cleanAllStores from '@/store/utils/cleanAllStores';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';
import { toast } from 'sonner';
import ROOT_ROUTE from '@libs/common/constants/rootRoute';
import COOKIE_DESCRIPTORS from '@libs/common/constants/cookieDescriptors';
import useSilentLoginWithPassword from '@/pages/LoginPage/useSilentLoginWithPassword';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';

type UseLogoutProps = {
  isForceLogout?: boolean;
};

const useLogout = ({ isForceLogout = false }: UseLogoutProps = {}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { pathname } = window.location;
  const { logout } = useUserStore();
  const [, , removeCookie] = useCookies([COOKIE_DESCRIPTORS.AUTH_TOKEN]);
  const { silentLogout } = useSilentLoginWithPassword();

  const publicAppConfigs = useAppConfigsStore((s) => s.publicAppConfigs);
  const isPublicPage = publicAppConfigs?.some((config) => config.name === pathname.split('/')[1]);

  const handleLogout = useCallback(async () => {
    await logout();

    await auth.removeUser();

    if (isForceLogout || isPublicPage) {
      window.history.replaceState({}, '', LOGIN_ROUTE);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    await cleanAllStores();

    removeCookie(COOKIE_DESCRIPTORS.AUTH_TOKEN, {
      path: ROOT_ROUTE,
      domain: window.location.hostname,
    });

    await silentLogout();

    toast.dismiss();

    if (auth.user?.expired) {
      toast.error(t('auth.errors.TokenExpired'));
    } else {
      toast.success(t('auth.logout.success'), {
        id: 'logout-success',
      });
    }
  }, [auth, isPublicPage]);

  return handleLogout;
};

export default useLogout;
