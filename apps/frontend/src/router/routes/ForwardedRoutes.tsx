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
import { Route } from 'react-router-dom';
import BlankLayout from '@/components/layout/BlankLayout';
import ForwardingPage from '@/pages/ForwardingPage/ForwardingPage';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';

const getForwardedRoutes = (appConfigs: AppConfigDto[]) => [
  <Route
    key="forwarding"
    element={<BlankLayout />}
  >
    {appConfigs
      .filter((item) => item.appType === APP_INTEGRATION_VARIANT.FORWARDED)
      .map((item) => (
        <Route
          key={item.name}
          path={item.name}
          element={<ForwardingPage />}
        />
      ))}
  </Route>,
];

export default getForwardedRoutes;
