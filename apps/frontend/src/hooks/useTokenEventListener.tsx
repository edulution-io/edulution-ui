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

import { useEffect, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
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

  const onSilentRenewError = () => {
    if (alreadyLoggedOutRef.current) return;

    toast.warning(t('auth.errors.SessionExpiring'));
  };

  useEffect(() => {
    auth.events.addSilentRenewError(onSilentRenewError);
    auth.events.addAccessTokenExpired(handleTokenExpiredRef.current);

    return () => {
      auth.events.removeSilentRenewError(onSilentRenewError);
      auth.events.removeAccessTokenExpired(handleTokenExpiredRef.current);
    };
  }, []);
};

export default useTokenEventListeners;
