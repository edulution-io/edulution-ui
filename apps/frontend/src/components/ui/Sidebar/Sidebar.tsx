import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'usehooks-ts';
import { SettingsIcon } from '@/assets/icons';
import { findAppConfigByName } from '@/utils/common';
import useAppConfigsStore from '@/store/appConfigsStore';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';

const Sidebar: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const sidebarIconsRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const { appConfig } = useAppConfigsStore();

  const sidebarItems = [
    ...APP_CONFIG_OPTIONS.filter((option) => findAppConfigByName(appConfig, option.id)).map((item) => ({
      title: t(`${item.id}.sidebar`),
      link: `/${item.id}`,
      icon: item.icon,
      color: 'bg-ciGreenToBlue',
    })),
    {
      title: t('settings.sidebar'),
      link: '/settings',
      icon: SettingsIcon,
      color: 'bg-ciGreenToBlue',
    },
  ];

  const sidebarProps = {
    sidebarItems,
  };

  return isDesktop ? (
    <DesktopSidebar
      ref={sidebarIconsRef}
      {...sidebarProps}
    />
  ) : (
    <MobileSidebar
      ref={sidebarIconsRef}
      {...sidebarProps}
    />
  );
};

export default Sidebar;
