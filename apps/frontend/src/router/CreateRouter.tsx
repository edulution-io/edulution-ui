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
import { createBrowserRouter, createRoutesFromElements, Outlet, Route } from 'react-router-dom';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import {
  LANGUAGE_PATH,
  MAILS_PATH,
  MOBILE_ACCESS_PATH,
  SECURITY_PATH,
  USER_DETAILS_PATH,
  USER_SETTINGS_PATH,
} from '@libs/userSettings/constants/user-settings-endpoints';
import getClassManagementRoutes from '@/router/routes/ClassManagementRoutes';
import UserSettingsMailsPage from '@/pages/UserSettings/Mails/UserSettingsMailsPage';
import UserSettingsDetailsPage from '@/pages/UserSettings/Details/UserSettingsDetailsPage';
import UserSettingsSecurityPage from '@/pages/UserSettings/Security/UserSettingsSecurityPage';
import FILE_PREVIEW_ROUTE from '@libs/filesharing/constants/routes';
import LanguageSettingsPage from '@/pages/UserSettings/Language/LanguageSettingsPage';
import UserSettingsMobileAccess from '@/pages/UserSettings/MobileAccess/UserSettingsMobileAccess';
import getSurveyRoutes from '@/router/routes/SurveyRoutes';
import getPublicRoutes from '@/router/routes/PublicRoutes';
import APPS from '@libs/appconfig/constants/apps';
import BulletinBoardPage from '@/pages/BulletinBoard/BulletinBoardPage';
import FullScreenFileViewer from '@/pages/FileSharing/FilePreview/FullScreenFileViewer';
import AppLayout from '@/components/structure/layout/AppLayout';
import getNativeAppRoutes from '@/router/routes/NativeAppRoutes';
import getAuthRoutes from '@/router/routes/AuthRoutes';
import getSettingsRoutes from './routes/SettingsRoutes';
import getForwardedAppRoutes from './routes/ForwardedAppRoutes';
import getEmbeddedAppRoutes from './routes/EmbeddedAppRoutes';
import getFileSharingRoutes from './routes/FileSharingRoutes';
import DashboardPage from '../pages/Dashboard/DashboardPage';

const createRouter = (isAuthenticated: boolean, appConfigs: AppConfigDto[]) =>
  createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<AppLayout />}>
          {getPublicRoutes()}

          {isAuthenticated && (
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
                  path=""
                  element={<UserSettingsSecurityPage />}
                />
                <Route
                  path={SECURITY_PATH}
                  element={<UserSettingsSecurityPage />}
                />
                <Route
                  path={USER_DETAILS_PATH}
                  element={<UserSettingsDetailsPage />}
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

              {getSettingsRoutes()}
              {getClassManagementRoutes()}
              {getSurveyRoutes()}
              {getFileSharingRoutes()}
            </>
          )}

          {getAuthRoutes(isAuthenticated)}
        </Route>

        <Route
          path={FILE_PREVIEW_ROUTE}
          element={<FullScreenFileViewer />}
        />
      </>,
    ),
  );

export default createRouter;
