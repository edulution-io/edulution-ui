import React from 'react';
import { Button } from '@/components/shared/Button';
import { useLocation, NavLink } from 'react-router-dom';
import MobileLogo from '@/assets/logos/edulution-logo-small-colorfull.svg';
import Firewall from '@/assets/icons/firewall-light.svg';
import Conferences from '@/assets/icons/edulution/Konferenzen.svg';
import LearningManagement from '@/assets/icons/edulution/Lernmanagement.svg';
import FileSharing from '@/assets/icons/edulution/Filesharing.svg';
import Virtualization from '@/assets/icons/edulution/Computer_Steuerung.svg';
import DesktopDeployment from '@/assets/icons/edulution/Virtual_Desktop.svg';
import Network from '@/assets/icons/edulution/Netzwerk.svg';
import Mail from '@/assets/icons/edulution/Mail.svg';
import SchoolInformation from '@/assets/icons/edulution/Information.svg';
import Printer from '@/assets/icons/edulution/Drucker.svg';
import RoomBooking from '@/assets/icons/edulution/Raumbuchung.svg';
import Forums from '@/assets/icons/edulution/Foren.svg';
import Chat from '@/assets/icons/edulution/Chat.svg';
import Wlan from '@/assets/icons/edulution/Wlan.svg';
import KnowledgeBase from '@/assets/icons/edulution/Wissensdatenbank.svg';
import User from '@/assets/icons/edulution/Benutzer.svg';
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
      title: translateKey('conferences'),
      link: '/conferences',
      icon: Conferences,
    },
    {
      title: translateKey('firewall'),
      link: '/firewall',
      icon: Firewall,
    },
    {
      title: translateKey('virtualization'),
      link: '/virtualization',
      icon: Virtualization,
    },
    {
      title: translateKey('learningManagement'),
      link: '/learning-management',
      icon: LearningManagement,
    },
    {
      title: translateKey('fileSharing'),
      link: '/file-sharing',
      icon: FileSharing,
    },
    {
      title: translateKey('desktopDeployment'),
      link: '/desktop-deployment',
      icon: DesktopDeployment,
    },
    {
      title: translateKey('network'),
      link: '/network',
      icon: Network,
    },
    {
      title: translateKey('mail'),
      link: '/mail',
      icon: Mail,
    },
    {
      title: translateKey('schoolInformation'),
      link: '/school-information',
      icon: SchoolInformation,
    },
    {
      title: translateKey('printer'),
      link: '/printer',
      icon: Printer,
    },
    {
      title: translateKey('roomBooking'),
      link: '/room-booking',
      icon: RoomBooking,
    },
    {
      title: translateKey('forums'),
      link: '/forums',
      icon: Forums,
    },
    {
      title: translateKey('chat'),
      link: '/chat',
      icon: Chat,
    },
    {
      title: translateKey('wlan'),
      link: '/wlan',
      icon: Wlan,
    },
    {
      title: translateKey('knowledgeBase'),
      link: '/knowledge-base',
      icon: KnowledgeBase,
    },
  ];

  const FINAL_ITEMS = isDesktop
    ? [
        {
          title: 'Home',
          link: '/',
          icon: MobileLogo,
        },
        ...MENU_ITEMS,
      ]
    : MENU_ITEMS;

  const renderListItem = () => (
    <div className="fixed right-0 top-0 z-50 bg-black md:bg-none">
      {isOpen && (
        <div className="mb-[80px] ml-[24px] text-right md:hidden">
          <Button
            variant="btn-primary"
            className="mb-4 mr-3 mt-4 rounded-[16px] border-[3px] border-solid bg-[#434343] text-white "
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

  if (!isDesktop) {
    return (
      <div>
        {!isOpen && (
          <Button
            className="fixed right-0 top-4 z-50 mr-3 rounded-[16px] border-[3px] border-solid bg-[#434343] md:hidden"
            variant="btn-primary"
            onClick={toggle}
          >
            {t('menu')}
          </Button>
        )}
        <div className="bg-[#1B1C1D] text-[#FFFFFE]">{isOpen && renderListItem()}</div>
      </div>
    );
  }
  return renderListItem();
};

export default Sidebar;
