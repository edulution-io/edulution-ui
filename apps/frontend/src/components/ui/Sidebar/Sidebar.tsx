import React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsIcon } from '@/assets/icons';
import { APPS } from '@libs/appconfig/types';
import { findAppConfigByName } from '@/utils/common';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import useIsMobileView from '@/hooks/useIsMobileView';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useNotificationStore from "@/store/useNotificationStore";
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const { notifications, getAppData } = useNotificationStore();
  const isMobileView = useIsMobileView();

  const sidebarItems = [
    ...APP_CONFIG_OPTIONS.filter((option) => findAppConfigByName(appConfigs, option.id)).map((item) => {

      const notify = item.allowNotifications && item.id in notifications ? getAppData(item.id as APPS) : undefined;
      if (item.allowNotifications) {
        console.log(`notification.${item.id} := ${JSON.stringify(notify, null, 2)}`);
      }

      return ({
        title: t(`${item.id}.sidebar`),
        link: `/${item.id}`,
        icon: item.icon,
        color: 'bg-ciGreenToBlue',
        showNotifications: notify?.active,
        countNotifications: notify?.count,
      })
    }),
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
