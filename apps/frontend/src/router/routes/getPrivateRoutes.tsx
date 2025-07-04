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
import { Navigate, Outlet, Route } from 'react-router-dom';
import getForwardedAppRoutes from '@/router/routes/getForwardedAppRoutes';
import getFramedRoutes from '@/router/routes/getFramedRoutes';
import getNativeAppRoutes from '@/router/routes/getNativeAppRoutes';
import {
  LANGUAGE_PATH,
  MAILS_PATH,
  MOBILE_ACCESS_PATH,
  SECURITY_PATH,
  USER_DETAILS_PATH,
  USER_SETTINGS_PATH,
} from '@libs/userSettings/constants/user-settings-endpoints';
import UserSettingsSecurityPage from '@/pages/UserSettings/Security/UserSettingsSecurityPage';
import UserSettingsDetailsPage from '@/pages/UserSettings/Details/UserSettingsDetailsPage';
import UserSettingsMailsPage from '@/pages/UserSettings/Mails/UserSettingsMailsPage';
import LanguageSettingsPage from '@/pages/UserSettings/Language/LanguageSettingsPage';
import UserSettingsMobileAccess from '@/pages/UserSettings/MobileAccess/MobileFileAccessSetupBox';
import getSettingsRoutes from '@/router/routes/getSettingsRoutes';
import getClassManagementRoutes from '@/router/routes/getClassManagementRoutes';
import getSurveyRoutes from '@/router/routes/getSurveyRoutes';
import getFileSharingRoutes from '@/router/routes/getFileSharingRoutes';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APPS from '@libs/appconfig/constants/apps';
import BulletinBoardPage from '@/pages/BulletinBoard/BulletinBoardPage';
import DefaultLandingPageAfterLogin from '@/components/structure/DefaultLandingPageAfterLogin';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import LANDING_PAGE_ROUTE from '@libs/dashboard/constants/landingPageRoute';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';
import ProtectedRoute from './ProtectedRoute';
import getEmbeddedRoutes from './getEmbeddedRoutes';

const getPrivateRoutes = (appConfigs: AppConfigDto[]) => (
  <>
    {getForwardedAppRoutes(appConfigs)}
    {getFramedRoutes(appConfigs)}
    {getNativeAppRoutes(appConfigs)}
    {getEmbeddedRoutes(appConfigs)}

    <Route
      path={LANDING_PAGE_ROUTE}
      element={<DefaultLandingPageAfterLogin />}
    />

    <Route
      path={DASHBOARD_ROUTE}
      element={<DashboardPage />}
    />

    <Route
      path={USER_SETTINGS_PATH}
      element={<Outlet />}
    >
      <Route
        index
        element={
          <Navigate
            to={USER_DETAILS_PATH}
            replace
          />
        }
      />
      <Route
        path={USER_DETAILS_PATH}
        element={<UserSettingsDetailsPage />}
      />
      <Route
        path={SECURITY_PATH}
        element={<UserSettingsSecurityPage />}
      />
      <Route
        path={MAILS_PATH}
        element={<UserSettingsMailsPage />}
      />
      <Route
        path={LANGUAGE_PATH}
        element={<LanguageSettingsPage />}
      />
      <Route
        path={MOBILE_ACCESS_PATH}
        element={<UserSettingsMobileAccess />}
      />
    </Route>

    <Route
      path={`${APPS.BULLETIN_BOARD}/:bulletinId`}
      element={<BulletinBoardPage />}
    />

    <Route element={<ProtectedRoute />}>{getSettingsRoutes()}</Route>
    {getClassManagementRoutes()}
    {getSurveyRoutes()}
    {getFileSharingRoutes()}
  </>
);

export default getPrivateRoutes;
