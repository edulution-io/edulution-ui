import React from 'react';
import { Button } from '@/components/shared/Button';
import { useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useToggle } from 'usehooks-ts';
import MobileLogo from '@/assets/logos/edulution-logo-small-colorfull.svg';
import User from '@/assets/icons/edulution/Benutzer.svg';
import MENU_ITEMS from '../../../data/MenuItems';

const Sidebar = () => {
  const { t } = useTranslation();
  const [isOpen, toggle] = useToggle(false);
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const FINAL_ITEMS = [
    ...(isDesktop ? [{ title: 'Home', link: '/', icon: MobileLogo }] : []),
    ...MENU_ITEMS.map((item) => ({ ...item, title: t(item.title) })),
  ];

  const renderListItem = () => (
    <div className={`fixed right-0 top-0 z-50 bg-black ${isDesktop ? 'md:bg-none' : ''}`}>
      {isOpen && (
        <div className="mb-[80px] ml-[24px] text-right md:hidden">
          <Button
            variant="btn-primary"
            className="mb-4 mr-3 mt-4 rounded-[16px] border-[3px] border-solid bg-[#434343] text-white"
            onClick={toggle}
          >
            {t('menu')}
          </Button>
        </div>
      )}
      {FINAL_ITEMS.map((item) => (
        <div
          className=""
          key={item.title}
        >
          <NavLink
            to={item.link}
            className={`group relative flex cursor-pointer items-center justify-end gap-4 border-t border-gray-500 bg-black px-4 py-2 hover:border-black md:block md:px-2 ${pathname === item.link ? 'bg-gradient-to-r from-[#94D15C] to-[#4087B3]' : ''}`}
          >
            <p className="text-md font-bold text-white md:hidden">{item.title}</p>
            <img
              src={item.icon}
              width="32px"
              height="32px"
              className="relative z-0"
              alt=""
            />
            <div className="absolute left-full top-0 z-[50] flex h-full items-center gap-4 rounded-l-xl bg-[#3E76AC] pl-4 pr-[38px] duration-300 ease-out group-hover:-translate-x-full">
              <p className="text-md whitespace-nowrap font-bold text-white">{item.title}</p>
              <img
                src={item.icon}
                width="32px"
                height="32px"
                alt=""
              />
            </div>
          </NavLink>
        </div>
      ))}

      <div
        className=""
        key="logout"
      >
        <NavLink
          onClick={(e) => {
            e.preventDefault();
            alert('Logout');
          }}
          to="/logout"
          className={`group relative flex cursor-pointer items-center justify-end gap-4 border-t border-gray-500 bg-black px-4 py-2 hover:border-black md:block md:px-2 ${pathname === '/logout' ? 'bg-gradient-to-r from-[#94D15C] to-[#4087B3]' : ''}`}
        >
          <p className="text-md font-bold text-white md:hidden">Logout</p>
          <img
            src={User}
            width="32px"
            height="32px"
            className="relative z-0"
            alt=""
          />
          <div className="absolute left-full top-0 z-[50] flex h-full items-center gap-4 rounded-l-xl bg-[#3E76AC] pl-4 pr-[38px] duration-300 ease-out group-hover:-translate-x-full">
            <p className="text-md whitespace-nowrap font-bold text-white">{t('Logout')}</p>
            <img
              src={User}
              width="32px"
              height="32px"
              alt=""
            />
          </div>
        </NavLink>
      </div>
    </div>
  );

  return (
    <div>
      {!isDesktop && !isOpen && (
        <Button
          className="fixed right-0 top-4 z-50 mr-3 rounded-[16px] border-[3px] border-solid bg-[#434343] md:hidden"
          variant="btn-primary"
          onClick={toggle}
        >
          {t('menu')}
        </Button>
      )}
      {isOpen || isDesktop ? renderListItem() : null}
    </div>
  );
};

export default Sidebar;
