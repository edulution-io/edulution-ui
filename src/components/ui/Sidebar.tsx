import React from 'react';
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

import translateKey from '@/utils/common';
import { useTranslation } from 'react-i18next';
import { useMediaQuery, useToggle } from 'usehooks-ts';

const Sidebar = () => {
  const { t } = useTranslation();
  const [isOpen, toggle] = useToggle(false);
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery('(min-width: 768px)');

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

  const FINAL_ITEMS = isDesktop
    ? [
        {
          title: 'Home',
          link: '/',
          icon: MobileLogo,
          color: 'bg-ciGreenToBlue',
        },
        ...MENU_ITEMS,
      ]
    : MENU_ITEMS;

  const renderListItem = () => (
    <div className="fixed right-0 top-0 z-50 bg-stone-900 md:bg-none">
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
      {FINAL_ITEMS.map((item) => (
        <div
          className=""
          key={item.title}
        >
          <NavLink
            to={item.link}
            className={`border-ciLightGrey group relative flex cursor-pointer items-center justify-end gap-4 border-b  px-4 py-2 hover:border-stone-900 md:block md:px-2 ${pathname === item.link && pathname !== '/' ? item.color : ''}`}
          >
            <p className="text-md font-bold md:hidden">{item.title}</p>
            <img
              src={item.icon}
              width="32px"
              height="32px"
              className="relative z-0"
              alt=""
            />
            <div
              className={`${item.color} absolute left-full top-0 z-[50] flex h-full items-center gap-4 rounded-l-xl pl-4 pr-[38px] duration-300 ease-out group-hover:-translate-x-full`}
            >
              <p className="text-md whitespace-nowrap font-bold">{item.title}</p>
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
            // alert('Logout');
          }}
          to="/logout"
          className={`group relative flex cursor-pointer items-center justify-end gap-4 border-t border-gray-500 bg-stone-900 px-4 py-2 hover:border-stone-900 md:block md:px-2 ${pathname === '/logout' ? 'bg-ciGreenToBlue' : ''}`}
        >
          <p className="text-md font-bold md:hidden">Logout</p>
          <img
            src={User}
            width="32px"
            height="32px"
            className="relative z-0"
            alt=""
          />
          <div className="bg-ciLightGrey absolute left-full top-0 z-[50] flex h-full items-center gap-4 rounded-l-xl pl-4 pr-[38px] duration-300 ease-out group-hover:-translate-x-full">
            <p className="text-md whitespace-nowrap font-bold">{t('Logout')}</p>
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
        <div className="bg-stone-900">{isOpen && renderListItem()}</div>
      </div>
    );
  }
  return renderListItem();
};

export default Sidebar;
