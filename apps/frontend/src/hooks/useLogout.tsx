/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
