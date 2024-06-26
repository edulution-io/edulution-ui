import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useWindowSize } from 'usehooks-ts';
import { SIDEBAR_ICON_WIDTH } from '@/constants/style';
import { SidebarMenuItemProps } from '@libs/ui/types/sidebar';
import { getFromPathName } from '@libs/common/utils';

const SidebarItem: React.FC<SidebarMenuItemProps> = ({ menuItem, isDesktop, translate }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const size = useWindowSize();
  const { pathname } = useLocation();

  const rootPathName = getFromPathName(pathname, [0, 1]);

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
          alt={`${menuItem.title}-icon`}
        />
        {isInView ? (
          <div
            className={`${menuItem.color} absolute left-full top-0 flex h-full items-center gap-4 rounded-l-[8px] pl-4 pr-[38px] duration-300 ${isDesktop ? 'ease-out group-hover:-translate-x-full' : ''}`}
          >
            <p className="whitespace-nowrap font-bold">{menuItem.title}</p>
            <img
              src={menuItem.icon}
              width={SIDEBAR_ICON_WIDTH}
              alt={`${menuItem.title}-icon`}
            />
          </div>
        ) : null}
      </NavLink>
    </div>
  );
};

export default SidebarItem;
