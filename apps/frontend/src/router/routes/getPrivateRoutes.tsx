/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
  NOTIFICATIONS_PATH,
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
import LANDING_PAGE_ROUTE from '@libs/dashboard/constants/landingPageRoute';
import NotificationsSettings from '@/pages/UserSettings/NotificationSettings/NotificationsSettings';
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
      <Route
        path={NOTIFICATIONS_PATH}
        element={<NotificationsSettings />}
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
