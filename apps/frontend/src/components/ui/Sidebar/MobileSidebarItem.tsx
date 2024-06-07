import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SIDEBAR_ICON_WIDTH } from '@/constants/style';
import { getFromPathName } from '@/utils/common';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/userStore';
import { SidebarMenuItem } from './sidebar';
import useSidebarStore from './sidebarStore';

interface SidebarItemProps {
  menuItem: SidebarMenuItem;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ menuItem }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { userInfo } = useUserStore();
  const { toggleMobileSidebar } = useSidebarStore();

  const userRole = userInfo?.ldapGroups?.role ?? '';

  const rootPathName = `/${getFromPathName(pathname, 1)}`;

  if (
    (userRole !== 'globaladministrator' && menuItem.title === t('settings.sidebar')) ||
    (userRole !== 'globaladministrator' && menuItem.title === t('ticketsystem.sidebar'))
  )
    return null;
  if (userRole === 'student' && menuItem.title === t('schoolmanagement.sidebar')) return null;

  return (
    <div
      key={menuItem.title}
      className="relative"
    >
      <NavLink
        to={menuItem.link}
        onClick={toggleMobileSidebar}
        className={`group relative flex cursor-pointer items-center justify-end gap-4 border-b-2 border-ciLightGrey px-4 py-2 md:block md:px-2 ${rootPathName === menuItem.link && pathname !== '/' ? menuItem.color : ''}`}
      >
        <p className="md:hidden">{menuItem.title}</p>
        <img
          src={menuItem.icon}
          width={SIDEBAR_ICON_WIDTH}
          className="relative"
          alt=""
        />
      </NavLink>
    </div>
  );
};

export default SidebarItem;
