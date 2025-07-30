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
import { RouterProvider } from 'react-router-dom';
import createRouter from '@/router/CreateRouter';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useUserStore from '@/store/UserStore/useUserStore';

const AppRouter: React.FC = () => {
  const { appConfigs } = useAppConfigsStore();
  const { isAuthenticated } = useUserStore();

  return <RouterProvider router={createRouter(isAuthenticated, appConfigs)} />;
};

export default AppRouter;
