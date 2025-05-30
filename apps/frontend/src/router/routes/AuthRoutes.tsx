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

import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage/LoginPage';
import LOGIN_ROUTE from '@libs/auth/constants/loginRoute';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';

const getAuthRoutes = (isAuthenticated: boolean) => [
  <Route
    key={LOGIN_ROUTE}
    path={LOGIN_ROUTE}
    element={<LoginPage />}
  />,
  <Route
    key="wildcard"
    path="*"
    element={
      isAuthenticated ? (
        <Navigate
          replace
          to={DASHBOARD_ROUTE}
        />
      ) : (
        <Navigate
          replace
          to={LOGIN_ROUTE}
          state={{ from: window.location.pathname }}
        />
      )
    }
  />,
];

export default getAuthRoutes;
