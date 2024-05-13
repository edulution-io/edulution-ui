import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/shared/Button';
import { NavLink, useLocation } from 'react-router-dom';

import { MobileLogoIcon, SettingsIcon, UserIcon, DocumentIcon } from '@/assets/icons';

import { IconContext } from 'react-icons';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';

import { useTranslation } from 'react-i18next';
import { useMediaQuery, useOnClickOutside, useToggle, useWindowSize } from 'usehooks-ts';
import { SETTINGS_APPSELECT_OPTIONS } from '@/constants/settings';
import { SIDEBAR_ICON_WIDTH, SIDEBAR_TRANSLATE_AMOUNT } from '@/constants/style';
import { useAuth } from 'react-oidc-context';
import { findAppConfigByName } from '@/utils/common';
import useAppConfigsStore from '@/store/appConfigsStore';
import useUserStore from '@/store/userStore';
import cleanAllStores from '@/store/utilis/cleanAllStores';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
  const [translate, setTranslate] = useState(0);
  const [isUpButtonVisible, setIsUpButtonVisible] = useState(false);
  const [isDownButtonVisible, setIsDownButtonVisible] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarIconsRef = useRef<HTMLDivElement>(null);
  const [isOpen, toggle] = useToggle();

  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const size = useWindowSize();
  const auth = useAuth();
  const { appConfig } = useAppConfigsStore();
  const { setIsAuthenticated } = useUserStore();

  const sidebarItems = [
    ...SETTINGS_APPSELECT_OPTIONS.filter((option) => findAppConfigByName(appConfig, option.id)).map((item) => ({
      title: t(`${item.id}.sidebar`),
      link: `/${item.id}`,
      icon: item.icon,
      color: item.color,
    })),
    {
      title: t(`survey.sidebar`),
      link: '/survey',
      icon: DocumentIcon,
      color: 'bg-ciGreenToBlue',
    },
    {
      title: t('settings.sidebar'),
      link: '/settings',
      icon: SettingsIcon,
      color: 'bg-ciGreenToBlue',
    },
  ];

  useOnClickOutside(sidebarRef, isOpen ? toggle : () => {});

  const sidebarClasses = `fixed top-0 right-0 z-40 h-full w-64 transform transition-transform duration-300 ease-in-out ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  }`;

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  useEffect(() => {
    setTranslate(0);
  }, [size]);

  useEffect(() => {
    setIsUpButtonVisible(translate > 0);

    if (sidebarIconsRef.current == null) return;

    const rect = sidebarIconsRef.current.getBoundingClientRect();
    setIsDownButtonVisible(rect.bottom > window.innerHeight - 58);
  }, [size, translate, sidebarItems]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      setTranslate((prevTranslate) => {
        if (sidebarIconsRef.current == null) {
          return prevTranslate;
        }
        if (isDownButtonVisible && e.deltaY > 0) {
          return prevTranslate + SIDEBAR_TRANSLATE_AMOUNT;
        }
        if (isUpButtonVisible && e.deltaY < 0 && translate > 0) {
          return prevTranslate - SIDEBAR_TRANSLATE_AMOUNT;
        }
        return prevTranslate;
      });
    },
    [isDownButtonVisible, isUpButtonVisible, translate],
  );

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

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      setStartY(event.touches[0].clientY);
    },
    [isDownButtonVisible, isUpButtonVisible, translate, startY],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      event.preventDefault();
      if (!startY) return;

      const deltaY = event.touches[0].clientY - startY;

      setTranslate((prevTranslate) => {
        if (sidebarIconsRef.current == null) {
          return prevTranslate;
        }
        if (isDownButtonVisible && deltaY > 0) return prevTranslate + 3;
        if (isUpButtonVisible && deltaY < 0 && translate > 0) return prevTranslate - 3;
        return prevTranslate;
      });
    },
    [isDownButtonVisible, isUpButtonVisible, startY, translate],
  );

  const handleTouchEnd = useCallback(() => {
    setStartY(null);
  }, [isDownButtonVisible, isUpButtonVisible, translate, startY]);

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
      className="rounded-xl border-[3px]"
      onClick={toggle}
    >
      {t('menu')}
    </Button>
  );

  const homeButton = () => (
    <div key="home">
      <NavLink
        to="/"
        className={`group relative right-0 top-0 z-[99] flex cursor-pointer items-center justify-end gap-4 border-b-2 border-ciLightGrey bg-black px-4 py-2 hover:bg-black md:block md:px-2 ${pathname === '/' ? 'bg-black' : ''}`}
      >
        <p className="text-md font-bold md:hidden">{t('home')}</p>
        <img
          src={MobileLogoIcon}
          width={SIDEBAR_ICON_WIDTH}
          alt=""
        />
        <div
          className={`absolute left-full top-0 z-[50] flex h-full items-center gap-4 rounded-l-[8px] bg-black pl-4 pr-[38px] duration-300 ${isDesktop ? 'ease-out group-hover:-translate-x-full' : ''}`}
        >
          <p className="text-md whitespace-nowrap font-bold">{t('home')}</p>
          <img
            src={MobileLogoIcon}
            width={SIDEBAR_ICON_WIDTH}
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
            const newTranslate = prevTranslate - SIDEBAR_TRANSLATE_AMOUNT;
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
        className={`absolute right-0 z-[99] w-full cursor-pointer items-center justify-end border-y-2 border-ciLightGrey bg-black px-4 py-2 hover:bg-stone-900 md:block md:px-2 ${isDesktop ? 'bottom-[58px]' : 'bottom-0 h-[58px] border-t-0'}`}
        onClick={() => {
          setTranslate((prevTranslate) => {
            if (sidebarIconsRef.current == null) {
              return prevTranslate;
            }

            const newTranslate = prevTranslate + SIDEBAR_TRANSLATE_AMOUNT;
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
    <div
      key="logout"
      className={`${isDesktop ? 'fixed bottom-0 right-0 border-t-2 bg-black ' : 'border-b-2 border-ciLightGrey'}`}
    >
      <NavLink
        onClick={() => {
          auth.removeUser().catch(console.error);
          setIsAuthenticated(false);
          cleanAllStores();
          sessionStorage.clear();
        }}
        to="/"
        className={`group flex h-[58px] cursor-pointer items-center justify-end gap-4 px-4 md:block md:px-2  ${pathname === '/logout' ? 'bg-black' : ''}`}
      >
        <p className="text-md font-bold md:hidden">{t('common.logout')}</p>
        <img
          src={UserIcon}
          width={SIDEBAR_ICON_WIDTH}
          className="relative z-0 "
          alt=""
        />
        {isDesktop ? (
          <div className="absolute bottom-0 left-full z-[50] flex h-full items-center gap-4 rounded-l-[8px] bg-black pl-4 pr-[38px] duration-300 ease-out group-hover:-translate-x-full">
            <p className="text-md whitespace-nowrap font-bold">{t('common.logout')}</p>
            <img
              src={UserIcon}
              width={SIDEBAR_ICON_WIDTH}
              alt=""
            />
          </div>
        ) : null}
      </NavLink>
    </div>
  );

  const renderListItem = () => (
    <div className="fixed right-0 h-screen bg-black bg-opacity-90 md:bg-none">
      {!isDesktop && isOpen ? (
        <>
          <div className="relative right-0 top-0 z-[98] h-[100px] bg-black" />
          <div className="fixed right-0 top-0 z-[99] pr-4 pt-4">{menuButton()}</div>
        </>
      ) : null}
      {homeButton()}
      {isUpButtonVisible ? upButton() : null}

      <div
        ref={sidebarIconsRef}
        style={{ transform: `translateY(-${translate}px)`, overflowY: !isDesktop ? 'scroll' : 'clip' }}
        onWheel={() => handleWheel}
        onTouchStart={() => handleTouchStart}
        onTouchMove={() => handleTouchMove}
        onTouchEnd={() => handleTouchEnd}
      >
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.link}
            menuItem={item}
            isDesktop={isDesktop}
            pathname={pathname}
            translate={translate}
          />
        ))}
        {!isDesktop ? logoutButton() : null}
      </div>
      {isDownButtonVisible ? downButton() : null}
      {isDesktop ? logoutButton() : null}
    </div>
  );

  if (!isDesktop) {
    return (
      <>
        {!isOpen ? <div className="fixed right-0 top-0 pr-4 pt-4">{menuButton()}</div> : null}
        <div
          ref={sidebarRef}
          className={`${sidebarClasses}`}
        >
          <div className="bg-black">{isOpen && renderListItem()}</div>
        </div>
      </>
    );
  }
  return renderListItem();
};

export default Sidebar;
