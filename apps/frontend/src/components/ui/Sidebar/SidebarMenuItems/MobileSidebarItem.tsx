import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SIDEBAR_ICON_WIDTH } from '@/constants/style';
import { SidebarMenuItemProps } from '@libs/ui/types/sidebar';
import { getFromPathName } from '@libs/common/utils';
import useSidebarStore from '../sidebarStore';

const MobileSidebarItem: React.FC<SidebarMenuItemProps> = ({ menuItem }) => {
  const { pathname } = useLocation();
  const { toggleMobileSidebar } = useSidebarStore();

  const rootPathName = getFromPathName(pathname, [0, 1]);
  const menuItemColor = rootPathName === menuItem.link && pathname !== '/' ? menuItem.color : '';

  return (
    <div
      key={menuItem.title}
      className="relative"
    >
      <NavLink
        to={menuItem.link}
        onClick={toggleMobileSidebar}
        className={`group relative flex cursor-pointer items-center justify-end gap-4 border-b-2 border-ciLightGrey px-4 py-2 md:block md:px-2 ${menuItemColor}`}
      >
        <p className="md:hidden">{menuItem.title}</p>
        <img
          src={menuItem.icon}
          width={SIDEBAR_ICON_WIDTH}
          className="relative"
          alt={`${menuItem.title}-icon`}
        />
      </NavLink>
    </div>
  );
};

export default MobileSidebarItem;
