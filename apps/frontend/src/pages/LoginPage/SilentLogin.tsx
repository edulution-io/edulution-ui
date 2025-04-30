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

import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import useUserStore from '@/store/UserStore/UserStore';

const SilentLogin: React.FC = () => {
  const auth = useAuth();
  const { eduApiToken } = useUserStore();

  useEffect(() => {
    if (eduApiToken) {
      console.info('Silent Login wird durchgeführt');
      void auth.signinSilent().catch((err) => console.error('Silent Login fehlgeschlagen:', err));
    }
  }, [eduApiToken]);

  return null;
};

export default SilentLogin;
