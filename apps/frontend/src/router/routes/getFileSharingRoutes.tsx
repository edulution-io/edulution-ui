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
import FileSharingPage from '@/pages/FileSharing/FileSharingPage';
import APPS from '@libs/appconfig/constants/apps';
import PublicShareLinksPage from '@/pages/FileSharing/publicShare/PublicShareLinksPage';
import FileSharingRedirect from '@/pages/FileSharing/FileSharingRedirect';

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
      path=":mointPoint/*"
      element={<FileSharingPage />}
    />
    <Route
      path="shared"
      element={<PublicShareLinksPage />}
    />
  </Route>,
];

export default getFileSharingRoutes;
