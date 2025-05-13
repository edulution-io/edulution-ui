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

import useUserStore from '@/store/UserStore/UserStore';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SigninSilent: React.FC = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    // nicht auf der Callback-Route selbst injecten
    if (isAuthenticated && pathname !== '/authentication/silent_callback') {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = [
        `${window.location.origin}/auth/realms/edulution/protocol/openid-connect/auth`,
        `?client_id=edu-ui`,
        `&redirect_uri=${encodeURIComponent(`${window.location.origin}/authentication/silent_callback`)}`,
        `&response_type=code`,
        `&scope=openid`,
        `&prompt=none`,
      ].join('');
      document.body.appendChild(iframe);
    }
  }, [pathname, isAuthenticated]);

  return null;
};

export default SigninSilent;
