import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import { useLocation, NavLink } from 'react-router-dom';

import { MobileLogo, Settings, User } from '@/assets/icons';

import { IconContext } from 'react-icons';
import { MdArrowDropUp, MdArrowDropDown } from 'react-icons/md';

import { useTranslation } from 'react-i18next';
import { useLocalStorage, useMediaQuery, useToggle, useWindowSize } from 'usehooks-ts';
import { SETTINGS_APPSELECT_OPTIONS } from '@/constants';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
  const [translate, setTranslate] = useState(0);
  const [upButtonVisible, setUpButtonVisible] = useState(false);
  const [downButtonVisible, setDownButtonVisible] = useState(false);

  const sidebarIconsRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const [isOpen, toggle] = useToggle(false);
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const size = useWindowSize();

  const TRANSLATE_AMOUNT = 58;

  type ConfigType = {
    [key: string]: { linkPath: string };
  };
  const [config] = useLocalStorage<ConfigType>('edu-config', {});

  const sidebarItems = [
    ...SETTINGS_APPSELECT_OPTIONS.filter((option) => config[option.name.toLowerCase().split('.')[0]] !== undefined).map(
      (item) => ({
        title: t(item.name),
        link: item.name.split('.')[0],
        icon: item.icon,
        color: item.color,
      }),
    ),
    {
      title: t('settings.sidebar'),
      link: '/settings',
      icon: Settings,
      color: 'bg-ciGreenToBlue',
    },
  ];

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  useEffect(() => {
    setTranslate(0);
  }, [size]);

  useEffect(() => {
    setUpButtonVisible(translate > 0);

    if (sidebarIconsRef.current == null) return;

    const rect = sidebarIconsRef.current.getBoundingClientRect();
    setDownButtonVisible(rect.bottom > window.innerHeight - 58);
  }, [size, translate, sidebarItems]);

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    setTranslate((prevTranslate) => {
      if (sidebarIconsRef.current == null) {
        return prevTranslate;
      }
      if (downButtonVisible && e.deltaY > 0) return prevTranslate + TRANSLATE_AMOUNT;
      if (upButtonVisible && e.deltaY < 0 && translate > 0) return prevTranslate - TRANSLATE_AMOUNT;
      return prevTranslate;
    });
  };

  useEffect(() => {
    const container = sidebarIconsRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  const [startY, setStartY] = useState<number | null>(null);

  const handleTouchStart = (event: TouchEvent) => {
    setStartY(event.touches[0].clientY);
  };

  const handleTouchMove = (event: TouchEvent) => {
    event.preventDefault();
    if (!startY) return;

    const deltaY = event.touches[0].clientY - startY;

    setTranslate((prevTranslate) => {
      if (sidebarIconsRef.current == null) {
        return prevTranslate;
      }
      if (downButtonVisible && deltaY > 0) return prevTranslate + 3;
      if (upButtonVisible && deltaY < 0 && translate > 0) return prevTranslate - 3;
      return prevTranslate;
    });
  };

  const handleTouchEnd = () => {
    setStartY(null);
  };

  useEffect(() => {
    const container = sidebarIconsRef.current;
    if (container) {
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const menuButton = () => (
    <Button
      variant="btn-outline"
      size="sm"
      className="rounded-[16px] border-[3px]"
      onClick={toggle}
    >
      {t('menu')}
    </Button>
  );

  const homeButton = () => (
    <div key="home">
      <NavLink
        to="/"
        className={`group relative right-0 top-0 z-[99] flex cursor-pointer items-center justify-end gap-4 border-b-2 border-ciLightGrey bg-black px-4 py-2 hover:bg-black md:block md:px-2 ${pathname === '/' && pathname !== '/' ? 'bg-black' : ''}`}
      >
        <p className="text-md font-bold md:hidden">{t('home')}</p>
        <img
          src={MobileLogo}
          width="40px"
          height="40px"
          alt=""
        />
        <div
          className={`absolute left-full top-0 z-[50] flex h-full items-center gap-4 rounded-l-xl bg-black pl-4 pr-[38px] duration-300 ${isDesktop ? 'ease-out group-hover:-translate-x-full' : ''}`}
        >
          <p className="text-md whitespace-nowrap font-bold">{t('home')}</p>
          <img
            src={MobileLogo}
            width="40px"
            height="40px"
            alt=""
          />
        </div>
      </NavLink>
    </div>
  );

  const upButton = () => (
    <div key="up">
      <button
        type="button"
        className={`relative right-0 z-[50] w-full cursor-pointer border-b-2 border-ciLightGrey bg-black px-4 py-2 hover:bg-stone-900 md:block md:px-2 ${isDesktop ? '' : 'top-0 h-[58px] border-t-2'}`}
        onClick={() => {
          setTranslate((prevTranslate) => {
            const newTranslate = prevTranslate - TRANSLATE_AMOUNT;
            if (newTranslate <= 0) return 0;
            return newTranslate;
          });
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <IconContext.Provider value={iconContextValue}>
            <MdArrowDropUp />
          </IconContext.Provider>
        </div>
      </button>
    </div>
  );

  const downButton = () => (
    <div key="down">
      <button
        type="button"
        className={`absolute right-0 z-[99] w-full cursor-pointer items-center justify-end border-y-2 border-ciLightGrey bg-black px-4 py-2 hover:bg-stone-900 md:block md:px-2 ${isDesktop ? 'bottom-10' : 'bottom-0 h-[58px] border-t-0'}`}
        onClick={() => {
          setTranslate((prevTranslate) => {
            if (sidebarIconsRef.current == null) {
              return prevTranslate;
            }

            const newTranslate = prevTranslate + TRANSLATE_AMOUNT;
            return newTranslate;
          });
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <IconContext.Provider value={iconContextValue}>
            <MdArrowDropDown />
          </IconContext.Provider>
        </div>
      </button>
    </div>
  );

  const logoutButton = () => (
    <div key="logout">
      <NavLink
        onClick={(e) => {
          e.preventDefault();
        }}
        to="/logout"
        className={`group fixed bottom-0 right-0 flex cursor-pointer items-center justify-end gap-4 border-t-2 border-ciLightGrey bg-black px-4 md:block md:px-2 ${pathname === '/logout' ? 'bg-black' : ''}`}
      >
        <p className="text-md font-bold md:hidden">{t('common.logout')}</p>
        <img
          src={User}
          width="40px"
          height="40px"
          className="relative z-0 "
          alt=""
        />
        <div
          className={`absolute bottom-0 left-full z-[50] flex h-full items-center gap-4 rounded-l-xl border-ciLightGrey bg-black pl-4 pr-[38px] duration-300 ${isDesktop ? ' ease-out group-hover:-translate-x-full' : ''}`}
        >
          <p className="text-md whitespace-nowrap font-bold">{t('common.logout')}</p>
          <img
            src={User}
            width="40px"
            height="40px"
            alt=""
          />
        </div>
      </NavLink>
    </div>
  );

  const renderListItem = () => (
    <div className="fixed right-0 h-screen bg-black bg-opacity-90 md:bg-none">
      {!isDesktop && isOpen ? (
        <>
          <div className="relative right-0 top-0 z-[50] h-[100px] bg-black" />
          <div className="fixed right-0 top-0 z-[99] pr-4 pt-4">{menuButton()}</div>
        </>
      ) : null}
      {isDesktop ? homeButton() : null}
      {upButtonVisible ? upButton() : null}

      <div
        ref={sidebarIconsRef}
        style={{ transform: `translateY(-${translate}px)`, overflowY: !isDesktop ? 'scroll' : 'clip' }}
        onClickCapture={toggle}
        onWheel={() => handleWheel}
        onTouchStart={() => handleTouchStart}
        onTouchMove={() => handleTouchMove}
        onTouchEnd={() => handleTouchEnd}
      >
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.title}
            menuItem={item}
            isDesktop={isDesktop}
            pathname={pathname}
            translate={translate}
          />
        ))}
      </div>
      {downButtonVisible ? downButton() : null}
      {isDesktop ? logoutButton() : null}
    </div>
  );

  if (!isDesktop) {
    return (
      <div>
        {!isOpen ? <div className="fixed right-0 top-0 pr-4 pt-4">{menuButton()}</div> : null}
        <div className="bg-black">{isOpen && renderListItem()}</div>
      </div>
    );
  }
  return renderListItem();
};

export default Sidebar;
