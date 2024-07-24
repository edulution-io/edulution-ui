import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useWindowSize } from 'usehooks-ts';
import { FaStarOfLife } from 'react-icons/fa';
import { SIDEBAR_ICON_WIDTH, SIDEBAR_TRANSLATE_AMOUNT } from '@libs/ui/constants';
import { SidebarMenuItemProps } from '@libs/ui/types/sidebar';
import { getRootPathName } from '@libs/common/utils';
import { APPS } from '@libs/appconfig/types';
import useMailStore from '@/pages/Dashboard/Feed/mails/MailStore';

const SidebarItem: React.FC<SidebarMenuItemProps> = ({ menuItem, isDesktop, translate }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const size = useWindowSize();
  const { pathname } = useLocation();

  const rootPathName = getRootPathName(pathname);

  const { fetchedNewMails } = useMailStore();

  useEffect(() => {
    if (buttonRef.current == null) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setIsInView(rect.bottom < window.innerHeight - SIDEBAR_TRANSLATE_AMOUNT);
  }, [translate, size]);

  const showStar = useMemo(() => {
    if (menuItem.link === `/${APPS.MAIL}`) {
      return fetchedNewMails;
    }
    return false;
  }, [menuItem, fetchedNewMails]);

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
        <>
          <img
            src={menuItem.icon}
            width={SIDEBAR_ICON_WIDTH}
            className="relative z-0"
            alt={`${menuItem.title}-icon`}
          />
          {showStar ? (
            <FaStarOfLife
              color="#88D840"
              className="width-4px h-4px absolute right-1 top-1"
            />
          ) : null}
        </>
        {isInView ? (
          <div
            className={`${menuItem.color} absolute left-full top-0 flex h-full items-center gap-4 rounded-l-[8px] pl-4 pr-[48px] ${isDesktop ? 'ease-out group-hover:-translate-x-full' : ''}`}
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
