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
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import FILE_PREVIEW_ROUTE from '@libs/filesharing/constants/routes';
import getPublicRoutes from '@/router/routes/getPublicRoutes';
import FullScreenFileViewer from '@/pages/FileSharing/FilePreview/FullScreenFileViewer';
import AppLayout from '@/components/structure/layout/AppLayout';
import getAuthRoutes from '@/router/routes/getAuthRoutes';
import getPrivateRoutes from '@/router/routes/getPrivateRoutes';

const createRouter = (isAuthenticated: boolean, appConfigs: AppConfigDto[]) =>
  createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<AppLayout />}>
          {getPublicRoutes()}

          {isAuthenticated && getPrivateRoutes(appConfigs)}

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
