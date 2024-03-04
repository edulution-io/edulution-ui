import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useWindowSize } from 'usehooks-ts';

type MenuItem = {
  title: string;
  link: string;
  icon: string;
  color: string;
};

interface SidebarItemProps {
  menuItem: MenuItem;
  isDesktop: boolean;
  pathname: string;
  translate: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ menuItem, isDesktop, pathname, translate }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const size = useWindowSize();

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
        className={`border-ciLightGrey group relative z-[99] flex cursor-pointer items-center justify-end gap-4 border-b-2 px-4 py-2 md:block md:px-2 ${pathname === menuItem.link && pathname !== '/' ? menuItem.color : ''}`}
      >
        <p className="text-md font-bold md:hidden">{menuItem.title}</p>
        <img
          src={menuItem.icon}
          width="40px"
          height="40px"
          className="relative z-0"
          alt=""
        />
        {isInView ? (
          <div
            className={`${menuItem.color} absolute left-full top-0 flex h-full items-center gap-4 rounded-l-xl pl-4 pr-[38px] duration-300 ${isDesktop ? 'z-[99] ease-out group-hover:-translate-x-full' : ''}`}
          >
            <p className="text-md whitespace-nowrap font-bold">{menuItem.title}</p>
            <img
              src={menuItem.icon}
              width="40px"
              height="40px"
              alt=""
            />
          </div>
        ) : null}
      </NavLink>
    </div>
  );
};

export default SidebarItem;
