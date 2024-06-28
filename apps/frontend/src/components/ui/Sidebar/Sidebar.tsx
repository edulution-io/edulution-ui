import React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsIcon } from '@/assets/icons';
import { findAppConfigByName } from '@/utils/common';
import useAppConfigsStore from '@/store/appConfigsStore';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import useIsMobileView from '@/hooks/useIsMobileView';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const isMobileView = useIsMobileView();

  const sidebarItems = [
    ...APP_CONFIG_OPTIONS.filter((option) => findAppConfigByName(appConfigs, option.id)).map((item) => ({
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

  return isMobileView ? <MobileSidebar {...sidebarProps} /> : <DesktopSidebar {...sidebarProps} />;
};

export default Sidebar;
