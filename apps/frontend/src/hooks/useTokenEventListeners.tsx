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

import { useEffect, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import delay from '@libs/common/utils/delay';
import useLogout from './useLogout';

const useTokenEventListeners = () => {
  const { t } = useTranslation();
  const auth = useAuth();
  const handleLogout = useLogout();
  const alreadyLoggedOutRef = useRef(false);

  const handleTokenExpiredRef = useRef<() => void>(() => {
    if (alreadyLoggedOutRef.current) return;
    alreadyLoggedOutRef.current = true;

    void handleLogout();
  });

  useEffect(() => {
    if (auth.user?.expired) {
      handleTokenExpiredRef.current();
    }
  }, [auth.user?.expired]);

  useEffect(() => {
    const removeUserLoaded = auth.events.addUserLoaded(() => {
      alreadyLoggedOutRef.current = false;
    });

    return () => {
      removeUserLoaded();
    };
  }, [auth.events]);

  const handleRenew = async (message: string) => {
    if (alreadyLoggedOutRef.current) return;

    if (!auth.user?.expired) {
      console.info(message);

      await delay(2000);
      const response = await auth.signinSilent();
      if (!response) {
        await handleRenew('Retry token renew');
      }
    } else {
      alreadyLoggedOutRef.current = true;
      toast.error(t('auth.errors.TokenExpired'));
      await handleLogout();
    }
  };

  useEffect(() => {
    auth.events.addSilentRenewError(() => handleRenew('Token renew error.'));
    auth.events.addAccessTokenExpiring(() => handleRenew('Token expiring. Try renew.'));
    auth.events.addAccessTokenExpired(handleTokenExpiredRef.current);

    return () => {
      auth.events.removeSilentRenewError(() => handleRenew('Token renew error.'));
      auth.events.removeAccessTokenExpiring(() => handleRenew('Token expiring. Try renew.'));
      auth.events.removeAccessTokenExpired(handleTokenExpiredRef.current);
    };
  }, []);
};

export default useTokenEventListeners;
