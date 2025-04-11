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

import React, { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route } from 'react-router-dom';
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import AppStorePage from '@/pages/Settings/AppConfig/appStore/AppStorePage';
import APPS from '@libs/appconfig/constants/apps';
import CONTAINER from '@libs/docker/constants/container';
import TABS from '@libs/common/constants/tabsElementId';

const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage'));

const getLazySettingsPage = () => (
  <Suspense fallback={<CircleLoader />}>
    <SettingsPage />
  </Suspense>
);

const getSettingsRoutes = () => [
  <Route
    key={SETTINGS_PATH}
    path={SETTINGS_PATH}
    element={<Outlet />}
  >
    <Route
      index
      element={
        <Navigate
          to={`${TABS}/${CONTAINER}`}
          replace
        />
      }
    />
    <Route
      path={APPS.APPSTORE}
      element={<AppStorePage />}
    />
    <Route path={TABS}>
      <Route
        path=""
        element={
          <Navigate
            to={CONTAINER}
            replace
          />
        }
      />
      <Route
        path=":tabId"
        element={getLazySettingsPage()}
      />
    </Route>
    <Route
      path=":settingLocation"
      element={getLazySettingsPage()}
    />
  </Route>,
];

export default getSettingsRoutes;
