import React from 'react';
import { useTranslation } from 'react-i18next';
import { APPS } from '@libs/appconfig/types';
import { SettingsIcon } from '@/assets/icons';
import { findAppConfigByName } from '@/utils/common';
import { APP_CONFIG_OPTIONS } from '@/pages/Settings/AppConfig/appConfigOptions';
import useIsMobileView from '@/hooks/useIsMobileView';
import useLdapGroups from '@/hooks/useLdapGroups';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useNotifications from '@/pages/Dashboard/Feed/components/useNotifications';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { appConfigs } = useAppConfigsStore();
  const { isSuperAdmin } = useLdapGroups();
  const isMobileView = useIsMobileView();

  const { mailsNotificationCounter, runningConferencesNotificationCounter } = useNotifications();

  const getNotificationCounter = (app: APPS): number | undefined => {
    switch (app) {
      case APPS.MAIL:
        return mailsNotificationCounter;
      case APPS.CONFERENCES:
        return runningConferencesNotificationCounter;
      default:
        return undefined;
    }
  };

  const sidebarItems = [
    ...APP_CONFIG_OPTIONS.filter((option) => findAppConfigByName(appConfigs, option.id)).map((item) => ({
      title: t(`${item.id}.sidebar`),
      link: `/${item.id}`,
      icon: item.icon,
      color: 'bg-ciGreenToBlue',
      notificationCounter: getNotificationCounter(item.id as APPS),
    })),
    ...(isSuperAdmin
      ? [
          {
            title: t('settings.sidebar'),
            link: '/settings',
            icon: SettingsIcon,
            color: 'bg-ciGreenToBlue',
          },
        ]
      : []),
  ];

  const sidebarProps = {
    sidebarItems,
  };

  return isMobileView ? <MobileSidebar {...sidebarProps} /> : <DesktopSidebar {...sidebarProps} />;
};

export default Sidebar;
