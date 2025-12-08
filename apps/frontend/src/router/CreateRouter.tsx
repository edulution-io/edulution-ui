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
