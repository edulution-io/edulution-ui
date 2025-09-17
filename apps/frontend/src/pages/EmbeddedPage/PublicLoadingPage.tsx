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
import { useLocation, useNavigate } from 'react-router-dom';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';
import useUserStore from '@/store/UserStore/useUserStore';

const PublicLoadingPage = () => {
  const { publicAppConfigs, isGetPublicAppConfigsLoading } = useAppConfigsStore();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated || isGetPublicAppConfigsLoading) return;

    if (publicAppConfigs.length > 0) {
      const currentPath = location.pathname.replace(/^\//, '');
      const hasMatch = publicAppConfigs.some((cfg) => cfg.name === currentPath);

      if (hasMatch) {
        return;
      }
    }

    navigate(LOGIN_ROUTE, {
      replace: true,
      state: { from: location.pathname },
    });
  }, [isGetPublicAppConfigsLoading, publicAppConfigs, location.pathname]);

  return <div />;
};

export default PublicLoadingPage;
