import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useWindowSize } from 'usehooks-ts';
import { SIDEBAR_ICON_WIDTH, SIDEBAR_TRANSLATE_AMOUNT } from '@libs/ui/constants';
import { SidebarMenuItemProps } from '@libs/ui/types/sidebar';
import { getRootPathName } from '@libs/common/utils';
import SidebarItemNotification from '@/components/ui/Sidebar/SidebarMenuItems/SidebarItemNotification';

const SidebarItem: React.FC<SidebarMenuItemProps> = ({ menuItem, isDesktop, translate }) => {
  const { title, icon, color, link, notificationCounter } = menuItem;
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const size = useWindowSize();
  const { pathname } = useLocation();

  const rootPathName = getRootPathName(pathname);

  useEffect(() => {
    if (buttonRef.current == null) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setIsInView(rect.bottom < window.innerHeight - SIDEBAR_TRANSLATE_AMOUNT);
  }, [translate, size]);

  return (
    <div
      key={title}
      className="relative"
      ref={buttonRef}
    >
      <NavLink
        to={link}
        className={`group relative z-[99] flex cursor-pointer items-center justify-end gap-4 border-b-2 border-ciLightGrey px-4 py-2 md:block md:px-2 ${rootPathName === menuItem.link && pathname !== '/' ? menuItem.color : ''}`}
      >
        <p className="md:hidden">{title}</p>
        <>
          <img
            src={icon}
            width={SIDEBAR_ICON_WIDTH}
            className="relative z-0"
            alt={`${title}-icon`}
          />
          <SidebarItemNotification notificationCounter={notificationCounter} />
        </>
        {isInView ? (
          <div
            className={`${color} absolute left-full top-0 flex h-full items-center gap-4 rounded-l-[8px] pl-4 pr-[48px] ${isDesktop ? 'ease-out group-hover:-translate-x-full' : ''}`}
          >
            <p className="whitespace-nowrap font-bold">{title}</p>
            <img
              src={icon}
              width={SIDEBAR_ICON_WIDTH}
              alt={`${title}-icon`}
            />
          </div>
        ) : null}
      </NavLink>
    </div>
  );
};

export default SidebarItem;
