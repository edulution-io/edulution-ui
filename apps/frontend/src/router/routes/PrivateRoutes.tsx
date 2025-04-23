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
import { Outlet, Route, Navigate } from 'react-router-dom';
import getForwardedAppRoutes from '@/router/routes/ForwardedAppRoutes';
import getEmbeddedAppRoutes from '@/router/routes/EmbeddedAppRoutes';
import getNativeAppRoutes from '@/router/routes/NativeAppRoutes';
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
import UserSettingsMobileAccess from '@/pages/UserSettings/MobileAccess/UserSettingsMobileAccess';
import APPS from '@libs/appconfig/constants/apps';
import BulletinBoardPage from '@/pages/BulletinBoard/BulletinBoardPage';
import getSettingsRoutes from '@/router/routes/SettingsRoutes';
import getClassManagementRoutes from '@/router/routes/ClassManagementRoutes';
import getSurveyRoutes from '@/router/routes/SurveyRoutes';
import getFileSharingRoutes from '@/router/routes/FileSharingRoutes';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import DashboardPage from '../../pages/Dashboard/DashboardPage';
import ProtectedRoute from './ProtectedRoute';

const getPrivateRoutes = (appConfigs: AppConfigDto[]) => (
  <>
    {getForwardedAppRoutes(appConfigs)}
    {getEmbeddedAppRoutes(appConfigs)}
    {getNativeAppRoutes(appConfigs)}

    <Route
      path="/"
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
