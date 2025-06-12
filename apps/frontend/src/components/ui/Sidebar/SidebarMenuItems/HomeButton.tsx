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
import { useTranslation } from 'react-i18next';
import { MobileLogoIcon } from '@/assets/icons';
import { SIDEBAR_ICON_WIDTH } from '@libs/ui/constants';
import DASHBOARD_ROUTE from '@libs/dashboard/constants/dashboardRoute';
import useSidebarStore from '../sidebarStore';

const HomeButton: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { toggleMobileSidebar } = useSidebarStore();

  return (
    <div key="home">
      <NavLink
        to={DASHBOARD_ROUTE}
        onClick={toggleMobileSidebar}
        className={`group relative right-0 top-0 z-50 flex max-h-14 cursor-pointer items-center justify-end gap-4 bg-black px-4 py-2 hover:bg-black hover:opacity-90 md:block md:px-3 ${pathname === DASHBOARD_ROUTE ? 'bg-black' : ''}`}
      >
        <p className="text-md font-bold md:hidden">{t('home')}</p>
        <img
          src={MobileLogoIcon}
          width={SIDEBAR_ICON_WIDTH}
          alt="edulution-mobile-logo"
        />
      </NavLink>
    </div>
  );
};

export default HomeButton;
