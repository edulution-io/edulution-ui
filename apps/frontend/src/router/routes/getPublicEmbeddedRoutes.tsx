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
import PublicEmbeddedPage from '@/pages/EmbeddedPage/PublicEmbeddedPage';

// ToDo: Make this dynamic via app config
const publicEmbeddedRoutes = ['imprint', 'impressum', 'legal', 'mensa', 'about', 'terms', 'privacy'];

const getPublicEmbeddedRoutes = () =>
  publicEmbeddedRoutes.map((item) => (
    <Route
      key={item}
      path={item}
      element={<PublicEmbeddedPage />}
    />
  ));
export default getPublicEmbeddedRoutes;
