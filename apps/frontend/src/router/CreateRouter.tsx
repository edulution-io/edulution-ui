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
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import {
  LANGUAGE_PATH,
  MAILS_PATH,
  SECURITY_PATH,
  USER_DETAILS_PATH,
  USER_SETTINGS_PATH,
} from '@libs/userSettings/constants/user-settings-endpoints';
import getAuthRoutes from '@/router/routes/AuthRoutes';
import getClassManagementRoutes from '@/router/routes/ClassManagementRoutes';
import NativeAppPage from '@/pages/NativeAppPage/NativeAppPage';
import UserSettingsMailsPage from '@/pages/UserSettings/Mails/UserSettingsMailsPage';
import UserSettingsDetailsPage from '@/pages/UserSettings/Details/UserSettingsDetailsPage';
import UserSettingsSecurityPage from '@/pages/UserSettings/Security/UserSettingsSecurityPage';
import FILE_PREVIEW_ROUTE from '@libs/filesharing/constants/routes';
import LanguageSettingsPage from '@/pages/UserSettings/Language/LanguageSettingsPage';
import getSurveyRoutes from '@/router/routes/SurveyRoutes';
import EmptyLayout from '@/components/layout/EmptyLayout';
import MainLayout from '@/components/layout/MainLayout';
import getPublicRoutes from '@/router/routes/PublicRoutes';
import APPS from '@libs/appconfig/constants/apps';
import BulletinBoardPage from '@/pages/BulletinBoard/BulletinBoardPage';
import FullScreenFileViewer from '@/pages/FileSharing/FilePreview/FullScreenFileViewer';
import getSettingsRoutes from './routes/SettingsRoutes';
import getForwardedRoutes from './routes/ForwardedRoutes';
import getEmbeddedRoutes from './routes/EmbeddedRoutes';
import DashboardPage from '../pages/Dashboard/DashboardPage';

const createRouter = (isAuthenticated: boolean, appConfigs: AppConfigDto[]) =>
  createBrowserRouter(
    createRoutesFromElements(
      <>
        {getPublicRoutes()}
        {getAuthRoutes(isAuthenticated)}
        {isAuthenticated ? (
          <>
            <Route element={<EmptyLayout />}>
              <Route
                path={FILE_PREVIEW_ROUTE}
                element={<FullScreenFileViewer />}
              />
            </Route>
            {getForwardedRoutes(appConfigs)}
            {getEmbeddedRoutes(appConfigs)}

            <Route element={<MainLayout />}>
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
              </Route>
              {appConfigs.map((item) =>
                item.appType === APP_INTEGRATION_VARIANT.NATIVE ? (
                  <Route
                    key={item.name}
                    path={item.name}
                    element={<NativeAppPage page={item.name} />}
                  />
                ) : null,
              )}

              <Route
                path={`${APPS.BULLETIN_BOARD}/:bulletinId`}
                element={<BulletinBoardPage />}
              />

              {getSettingsRoutes()}
              {getClassManagementRoutes()}
              {getSurveyRoutes()}
            </Route>
          </>
        ) : null}
      </>,
    ),
  );

export default createRouter;
