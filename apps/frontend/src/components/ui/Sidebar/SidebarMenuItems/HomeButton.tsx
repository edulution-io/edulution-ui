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
import { NavLink, useLocation } from 'react-router-dom';
import { MobileLogoIcon } from '@/assets/icons';
import { SIDEBAR_ICON_WIDTH_PX } from '@libs/ui/constants';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';
import useSidebarStore from '../sidebarStore';

const HomeButton: React.FC = () => {
  const { toggleMobileSidebar } = useSidebarStore();
  const { pathname } = useLocation();

  const isCurrentlySelectedItem = pathname === DASHBOARD_ROUTE;

  return (
    <NavLink
      to={DASHBOARD_ROUTE}
      onClick={toggleMobileSidebar}
      className={`flex h-14 cursor-pointer text-center hover:opacity-90  ${isCurrentlySelectedItem ? 'border border-gray-700' : ''}`}
    >
      <img
        src={MobileLogoIcon}
        width={SIDEBAR_ICON_WIDTH_PX}
        alt="edulution-mobile-logo"
      />
    </NavLink>
  );
};

export default HomeButton;
