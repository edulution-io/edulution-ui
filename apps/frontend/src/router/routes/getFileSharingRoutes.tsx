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
import { Route } from 'react-router-dom';
import FileSharingPage from '@/pages/FileSharing/FileSharingPage';
import APPS from '@libs/appconfig/constants/apps';
import PublicShareLinksPage from '@/pages/FileSharing/publicShare/PublicShareLinksPage';
import FileSharingRedirect from '@/pages/FileSharing/FileSharingRedirect';
import SHARED from '@libs/filesharing/constants/shared';

const getFileSharingRoutes = () => [
  <Route
    key={APPS.FILE_SHARING}
    path={APPS.FILE_SHARING}
  >
    <Route
      index
      element={<FileSharingRedirect />}
    />

    <Route
      path={SHARED}
      element={<PublicShareLinksPage />}
    />

    <Route
      path=":webdavShare"
      element={<FileSharingPage />}
    />
  </Route>,
];

export default getFileSharingRoutes;
