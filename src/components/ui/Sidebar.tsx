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

import translateKey from '@/utils/common';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useToggle, useWindowSize } from 'usehooks-ts';
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
    setUpButtonVisible(translate > 0);

    if (sidebarIconsRef.current == null) return;

    const rect = sidebarIconsRef.current.getBoundingClientRect();
    setDownButtonVisible(rect.bottom > window.innerHeight - 58);
  }, [size, translate, MENU_ITEMS]);

  const homeButton = () => (
    <div key="home">
      <NavLink
        to="/"
        className={`border-ciLightGrey group relative right-0 top-0 z-[99] flex cursor-pointer items-center justify-end gap-4 border-b-2 bg-black px-4 py-2 hover:bg-black md:block md:px-2 ${pathname === '/' && pathname !== '/' ? 'bg-black' : ''}`}
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
        className="border-ciLightGrey relative right-0 z-[99] w-full cursor-pointer border-b-2 bg-black px-4 py-2 hover:bg-stone-900 md:block md:px-2"
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
        className="border-ciLightGrey absolute bottom-10 right-0 z-[99] w-full cursor-pointer items-center justify-end border-y-2 bg-black px-4 py-2 hover:bg-stone-900 md:block md:px-2"
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
          // alert('Logout');
        }}
        to="/logout"
        className={`border-ciLightGrey group fixed bottom-0 flex cursor-pointer items-center justify-end gap-4 border-t-2 bg-black px-4 md:block md:px-2 ${pathname === '/logout' ? 'bg-black' : ''}`}
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
          className={`border-ciLightGrey absolute bottom-0 left-full z-[50] flex items-center gap-4 rounded-l-xl bg-black pl-4 pr-[38px] duration-300 ${isDesktop ? ' ease-out group-hover:-translate-x-full' : ''}`}
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
    <div className="fixed right-0 h-screen bg-black  md:bg-none">
      {isOpen && (
        <div className="mb-[80px] ml-[24px] text-right md:hidden">
          <Button
            variant="btn-collaboration"
            className="mb-4 mr-3 mt-4 rounded-[16px] border-[3px] border-solid"
            onClick={toggle}
          >
            {t('menu')}
          </Button>
        </div>
      )}
      {homeButton()}
      {upButtonVisible ? upButton() : null}
      <div
        ref={sidebarIconsRef}
        className="top-30"
        style={{ transform: `translateY(-${translate}px)` }}
        onWheel={(e) => {
          setTranslate((prevTranslate) => {
            if (sidebarIconsRef.current == null) {
              return prevTranslate;
            }
            if (downButtonVisible && e.deltaY > 0) return prevTranslate + TRANSLATE_AMOUNT;
            if (upButtonVisible && e.deltaY < 0 && translate > 0) return prevTranslate - TRANSLATE_AMOUNT;
            return prevTranslate;
          });
        }}
      >
        {MENU_ITEMS.map((item) => (
          <SidebarItem
            key={item.title}
            menuItem={item}
            isDesktop
            pathname={pathname}
            translate={translate}
          />
        ))}
      </div>
      {downButtonVisible ? downButton() : null}
      {logoutButton()}
    </div>
  );

  if (!isDesktop) {
    return (
      <div>
        {!isOpen && (
          <Button
            className="bg-ciLightGrey fixed right-0 top-4 z-50 mr-3 rounded-[16px] border-[3px] border-solid md:hidden"
            variant="btn-collaboration"
            onClick={toggle}
          >
            {t('menu')}
          </Button>
        )}
        <div className="bg-black">{isOpen && renderListItem()}</div>
      </div>
    );
  }
  return renderListItem();
};

export default Sidebar;
