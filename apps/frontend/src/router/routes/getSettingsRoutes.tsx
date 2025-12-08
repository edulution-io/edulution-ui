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
import { SETTINGS_PATH } from '@libs/appconfig/constants/appConfigPaths';
import APPS from '@libs/appconfig/constants/apps';
import CONTAINER from '@libs/docker/constants/container';
import TABS from '@libs/common/constants/tabsElementId';
import AppStorePage from '@/pages/Settings/AppConfig/appStore/AppStorePage';
import SettingsPage from '@/pages/Settings/SettingsPage';

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
        element={<SettingsPage />}
      />
    </Route>
    <Route
      path=":settingLocation"
      element={<SettingsPage />}
    />
  </Route>,
];

export default getSettingsRoutes;
