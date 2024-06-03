import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useWindowSize } from 'usehooks-ts';
import { SIDEBAR_ICON_WIDTH } from '@/constants/style';
import { getFromPathName } from '@/utils/common';
import { useTranslation } from 'react-i18next';

type SidebarMenuItem = {
  title: string;
  link: string;
  icon: string;
  color: string;
};

interface SidebarItemProps {
  userRole: string;
  menuItem: SidebarMenuItem;
  isDesktop: boolean;
  pathname: string;
  translate: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ userRole, menuItem, isDesktop, pathname, translate }) => {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const size = useWindowSize();

  const rootPathName = `/${getFromPathName(pathname, 1)}`;

  if (
    (userRole !== 'globaladministrator' && menuItem.title === t('settings.sidebar')) ||
    (userRole !== 'globaladministrator' && menuItem.title === t('ticketsystem.sidebar'))
  )
    return null;
  if (userRole === 'student' && menuItem.title === t('schoolmanagement.sidebar')) return null;

  useEffect(() => {
    if (buttonRef.current == null) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setIsInView(rect.bottom < window.innerHeight - 58);
  }, [translate, size]);

  return (
    <div
      key={menuItem.title}
      className="relative"
      ref={buttonRef}
    >
      <NavLink
        to={menuItem.link}
        className={`group relative z-[99] flex cursor-pointer items-center justify-end gap-4 border-b-2 border-ciLightGrey px-4 py-2 md:block md:px-2 ${rootPathName === menuItem.link && pathname !== '/' ? menuItem.color : ''}`}
      >
        <p className="md:hidden">{menuItem.title}</p>
        <img
          src={menuItem.icon}
          width={SIDEBAR_ICON_WIDTH}
          className="relative z-0"
          alt=""
        />
        {isInView ? (
          <div
            className={`${menuItem.color} absolute left-full top-0 flex h-full items-center gap-4 rounded-l-[8px] pl-4 pr-[48px]  ${isDesktop ? 'ease-out group-hover:-translate-x-full' : ''}`}
          >
            <p className="whitespace-nowrap font-bold">{menuItem.title}</p>
            <img
              src={menuItem.icon}
              width={SIDEBAR_ICON_WIDTH}
              alt=""
            />
          </div>
        ) : null}
      </NavLink>
    </div>
  );
};

export default SidebarItem;
