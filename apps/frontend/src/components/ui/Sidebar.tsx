import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import { useLocation, NavLink } from 'react-router-dom';

import {
  MobileLogo,
  Firewall,
  Conferences,
  LearningManagement,
  FileSharing,
  Virtualization,
  DesktopDeployment,
  Network,
  Mail,
  SchoolInformation,
  Printer,
  RoomBooking,
  Forums,
  Chat,
  Wlan,
  KnowledgeBase,
  User,
} from '@/assets/icons';

import { IconContext } from 'react-icons';
import { MdArrowDropUp, MdArrowDropDown } from 'react-icons/md';

import { translateKey } from '@/utils/common';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useToggle, useWindowSize } from 'usehooks-ts';
import { SIDEBAR_ICON_WIDTH, SIDEBAR_TRANSLATE_AMOUNT } from '@/constants/style';
import { useAuth } from 'react-oidc-context';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
  const [translate, setTranslate] = useState(0);
  const [isUpButtonVisible, setIsUpButtonVisible] = useState(false);
  const [isDownButtonVisible, setIsDownButtonVisible] = useState(false);

  const sidebarIconsRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const [isOpen, toggle] = useToggle(false);
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const size = useWindowSize();
  const auth = useAuth();

  // TODO: will move to separate file later
  const MENU_ITEMS = [
    {
      title: translateKey('conferences.sidebar'),
      link: '/conferences',
      icon: Conferences,
      color: 'bg-ciDarkBlue',
    },
    {
      title: translateKey('firewall'),
      link: '/firewall',
      icon: Firewall,
      color: 'bg-ciGreenToBlue',
    },
    {
      title: translateKey('virtualization'),
      link: '/virtualization',
      icon: Virtualization,
      color: 'bg-ciLightGreen',
    },
    {
      title: translateKey('learningManagement'),
      link: '/learning-management',
      icon: LearningManagement,
      color: 'bg-ciLightBlue',
    },
    {
      title: translateKey('fileSharing.sidebar'),
      link: '/file-sharing',
      icon: FileSharing,
      color: 'bg-ciDarkBlue',
    },
    {
      title: translateKey('desktopDeployment'),
      link: '/desktop-deployment',
      icon: DesktopDeployment,
      color: 'bg-ciLightGreen',
    },
    {
      title: translateKey('network'),
      link: '/network',
      icon: Network,
      color: 'bg-ciLightGreen',
    },
    {
      title: translateKey('mail'),
      link: '/mail',
      icon: Mail,
      color: 'bg-ciDarkBlue',
    },
    {
      title: translateKey('schoolInformation'),
      link: '/school-information',
      icon: SchoolInformation,
      color: 'bg-ciLightBlue',
    },
    {
      title: translateKey('printer'),
      link: '/printer',
      icon: Printer,
      color: 'bg-ciLightGreen',
    },
    {
      title: translateKey('roomBooking.sidebar'),
      link: '/room-booking',
      icon: RoomBooking,
      color: 'bg-ciLightBlue',
    },
    {
      title: translateKey('forums'),
      link: '/forums',
      icon: Forums,
      color: 'bg-ciDarkBlue',
    },
    {
      title: translateKey('chat'),
      link: '/chat',
      icon: Chat,
      color: 'bg-ciDarkBlue',
    },
    {
      title: translateKey('wlan'),
      link: '/wlan',
      icon: Wlan,
      color: 'bg-ciLightGreen',
    },
    {
      title: translateKey('knowledgeBase'),
      link: '/knowledge-base',
      icon: KnowledgeBase,
      color: 'bg-ciDarkBlue',
    },
  ];

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8' }), []);

  useEffect(() => {
    setTranslate(0);
  }, [size]);

  useEffect(() => {
    setIsUpButtonVisible(translate > 0);

    if (sidebarIconsRef.current == null) return;

    const rect = sidebarIconsRef.current.getBoundingClientRect();
    setIsDownButtonVisible(rect.bottom > window.innerHeight - 58);
  }, [size, translate, MENU_ITEMS]);

  const handleWheel = (e: WheelEvent) => {
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
      if (isDownButtonVisible && deltaY > 0) return prevTranslate + 3;
      if (isUpButtonVisible && deltaY < 0 && translate > 0) return prevTranslate - 3;
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
          src={MobileLogo}
          width={SIDEBAR_ICON_WIDTH}
          // height="40px"
          alt=""
        />
        <div
          className={`absolute left-full top-0 z-[50] flex h-full items-center gap-4 rounded-l-[8px] bg-black pl-4 pr-[38px] duration-300 ${isDesktop ? 'ease-out group-hover:-translate-x-full' : ''}`}
        >
          <p className="text-md whitespace-nowrap font-bold">{t('home')}</p>
          <img
            src={MobileLogo}
            width={SIDEBAR_ICON_WIDTH}
            // height="40px"
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
        className={`absolute right-0 z-[99] w-full cursor-pointer items-center justify-end border-y-2 border-ciLightGrey bg-black px-4 py-2 hover:bg-stone-900 md:block md:px-2 ${isDesktop ? 'bottom-10' : 'bottom-0 h-[58px] border-t-0'}`}
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
    <div key="logout">
      <NavLink
        onClick={() => {
          auth.removeUser().catch(console.error);
          // TODO: Remove if webdav is stored in backend
          sessionStorage.clear();
        }}
        to="/"
        className={`group fixed bottom-0 right-0 flex cursor-pointer items-center justify-end gap-4 border-t-2 border-ciLightGrey bg-black px-4 md:block md:px-2 ${pathname === '/logout' ? 'bg-black' : ''}`}
      >
        <p className="text-md font-bold md:hidden">{t('common.logout')}</p>
        <img
          src={User}
          width={SIDEBAR_ICON_WIDTH}
          className="relative z-0 "
          alt=""
        />
        <div
          className={`absolute bottom-0 left-full z-[50] flex h-full items-center gap-4 rounded-l-[8px] border-ciLightGrey bg-black pl-4 pr-[38px] duration-300 ${isDesktop ? ' ease-out group-hover:-translate-x-full' : ''}`}
        >
          <p className="text-md whitespace-nowrap font-bold">{t('common.logout')}</p>
          <img
            src={User}
            width={SIDEBAR_ICON_WIDTH}
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
      {isUpButtonVisible ? upButton() : null}

      <div
        ref={sidebarIconsRef}
        style={{ transform: `translateY(-${translate}px)`, overflowY: !isDesktop ? 'scroll' : 'clip' }}
        onClickCapture={toggle}
        onWheel={() => handleWheel}
        onTouchStart={() => handleTouchStart}
        onTouchMove={() => handleTouchMove}
        onTouchEnd={() => handleTouchEnd}
      >
        {MENU_ITEMS.map((item) => (
          <SidebarItem
            key={item.title}
            menuItem={item}
            isDesktop={isDesktop}
            pathname={pathname}
            translate={translate}
          />
        ))}
      </div>
      {isDownButtonVisible ? downButton() : null}
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
