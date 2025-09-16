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

import ROOT_ROUTE from '@libs/common/constants/rootRoute';
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="mt-3 text-center">
    <h1 className="mb-1 text-lg">404 - Page Not Found</h1>
    <p className="text-md mb-1">Oops! The page you are looking for does not exist.</p>
    <Link to={ROOT_ROUTE}>Go back to home</Link>
  </div>
);

export default NotFoundPage;
