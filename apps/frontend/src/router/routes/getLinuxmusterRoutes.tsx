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
import { Navigate, Route } from 'react-router-dom';
import {
  LINUXMUSTER_INFO_LOCATION,
  LINUXMUSTER_PATH,
  USER_MANAGEMENT_EXTRASTUDENTS_LOCATION,
  USER_MANAGEMENT_GLOBALADMINS_LOCATION,
  USER_MANAGEMENT_LOCATION,
  USER_MANAGEMENT_PARENTS_LOCATION,
  USER_MANAGEMENT_SCHOOLADMINS_LOCATION,
  USER_MANAGEMENT_STAFF_LOCATION,
  USER_MANAGEMENT_STUDENTS_LOCATION,
  USER_MANAGEMENT_TEACHERS_LOCATION,
} from '@libs/userManagement/constants/userManagementPaths';
import USER_MANAGEMENT_TABS from '@libs/userManagement/constants/userManagementTabs';
import { DEVICE_MANAGEMENT_LOCATION } from '@libs/deviceManagement/constants/deviceManagementPaths';
import LinuxmusterEntryPage from '@/pages/LinuxmusterPage/LinuxmusterEntryPage';
import LinuxmusterInfoPage from '@/pages/LinuxmusterPage/Info/LinuxmusterInfoPage';
import UserManagementPage from '@/pages/LinuxmusterPage/UserManagement/UserManagementPage';
import DeviceManagementPage from '@/pages/LinuxmusterPage/DeviceManagement/DeviceManagementPage';

const getLinuxmusterRoutes = () => [
  <Route
    key={LINUXMUSTER_PATH}
    path={LINUXMUSTER_PATH}
  >
    <Route
      path=""
      element={<LinuxmusterEntryPage />}
    />
    <Route
      path={LINUXMUSTER_INFO_LOCATION}
      element={<LinuxmusterInfoPage />}
    />
    <Route path={USER_MANAGEMENT_LOCATION}>
      <Route
        path={USER_MANAGEMENT_STUDENTS_LOCATION}
        element={
          <Navigate
            to={USER_MANAGEMENT_TABS.TABLE}
            replace
          />
        }
      />
      <Route
        path={`${USER_MANAGEMENT_STUDENTS_LOCATION}/:tabId`}
        element={<UserManagementPage userType="students" />}
      />
      <Route
        path={USER_MANAGEMENT_TEACHERS_LOCATION}
        element={
          <Navigate
            to={USER_MANAGEMENT_TABS.TABLE}
            replace
          />
        }
      />
      <Route
        path={`${USER_MANAGEMENT_TEACHERS_LOCATION}/:tabId`}
        element={<UserManagementPage userType="teachers" />}
      />
      <Route
        path={USER_MANAGEMENT_EXTRASTUDENTS_LOCATION}
        element={
          <Navigate
            to={USER_MANAGEMENT_TABS.TABLE}
            replace
          />
        }
      />
      <Route
        path={`${USER_MANAGEMENT_EXTRASTUDENTS_LOCATION}/:tabId`}
        element={<UserManagementPage userType="extrastudents" />}
      />
      <Route
        path={USER_MANAGEMENT_PARENTS_LOCATION}
        element={
          <Navigate
            to={USER_MANAGEMENT_TABS.TABLE}
            replace
          />
        }
      />
      <Route
        path={`${USER_MANAGEMENT_PARENTS_LOCATION}/:tabId`}
        element={<UserManagementPage userType="parents" />}
      />
      <Route
        path={USER_MANAGEMENT_STAFF_LOCATION}
        element={
          <Navigate
            to={USER_MANAGEMENT_TABS.TABLE}
            replace
          />
        }
      />
      <Route
        path={`${USER_MANAGEMENT_STAFF_LOCATION}/:tabId`}
        element={<UserManagementPage userType="staff" />}
      />
      <Route
        path={USER_MANAGEMENT_SCHOOLADMINS_LOCATION}
        element={
          <Navigate
            to={USER_MANAGEMENT_TABS.SCHOOLADMINS}
            replace
          />
        }
      />
      <Route
        path={`${USER_MANAGEMENT_SCHOOLADMINS_LOCATION}/:tabId`}
        element={<UserManagementPage userType="schooladmins" />}
      />
      <Route
        path={USER_MANAGEMENT_GLOBALADMINS_LOCATION}
        element={
          <Navigate
            to={USER_MANAGEMENT_TABS.GLOBALADMINS}
            replace
          />
        }
      />
      <Route
        path={`${USER_MANAGEMENT_GLOBALADMINS_LOCATION}/:tabId`}
        element={<UserManagementPage userType="globaladmins" />}
      />
    </Route>
    <Route
      path={DEVICE_MANAGEMENT_LOCATION}
      element={<DeviceManagementPage />}
    />
  </Route>,
];

export default getLinuxmusterRoutes;
