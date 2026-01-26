/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFromPathName } from '@libs/common/utils';
import { NotificationIcon } from '@/assets/icons';
import PageLayout from '@/components/structure/layout/PageLayout';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import useNotificationStore from '@/store/useNotificationStore';
import NOTIFICATION_PAGE_VIEW, { NotificationPageView } from '@libs/notification/constants/notificationPageView';
import NOTIFICATION_TYPE from '@libs/notification/constants/notificationType';
import { NOTIFICATION_FILTER_TYPE, NotificationFilterType } from '@libs/notification/types/notificationFilterType';
import { NOTIFICATIONSCENTER_ALL_PAGE } from '@libs/notification/constants/apiEndpoints';
import NotificationList from '@/pages/NotificationsCenter/components/NotificationList';
import NotificationsCenterFloatingButtons from '@/pages/NotificationsCenter/components/NotificationsCenterFloatingButtons';

const NotificationsCenterPage = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { notifications, isLoading, fetchNotifications, fetchUnreadCount } = useNotificationStore();

  const currentView = getFromPathName(pathname, 2) as NotificationPageView;

  useEffect(() => {
    if (!currentView) {
      navigate(NOTIFICATIONSCENTER_ALL_PAGE, { replace: true });
    }
  }, [currentView, navigate]);

  useEffect(() => {
    void fetchNotifications();
    void fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const filteredNotifications = useMemo(() => {
    switch (currentView) {
      case NOTIFICATION_PAGE_VIEW.MESSAGES:
        return notifications.filter((n) => n.type === NOTIFICATION_TYPE.USER);
      case NOTIFICATION_PAGE_VIEW.SYSTEM:
        return notifications.filter((n) => n.type === NOTIFICATION_TYPE.SYSTEM);
      case NOTIFICATION_PAGE_VIEW.ALL:
      default:
        return notifications;
    }
  }, [notifications, currentView]);

  const deleteType = useMemo((): NotificationFilterType => {
    switch (currentView) {
      case NOTIFICATION_PAGE_VIEW.MESSAGES:
        return NOTIFICATION_FILTER_TYPE.USER;
      case NOTIFICATION_PAGE_VIEW.SYSTEM:
        return NOTIFICATION_FILTER_TYPE.SYSTEM;
      default:
        return NOTIFICATION_FILTER_TYPE.ALL;
    }
  }, [currentView]);

  return (
    <PageLayout
      nativeAppHeader={{
        title: t('notificationscenter.appTitle'),
        description: t('notificationscenter.description'),
        iconSrc: NotificationIcon,
      }}
    >
      {isLoading && <LoadingIndicatorDialog isOpen />}

      {!isLoading && <NotificationList notifications={filteredNotifications} />}

      <NotificationsCenterFloatingButtons
        deleteType={deleteType}
        notificationCount={filteredNotifications.length}
      />
    </PageLayout>
  );
};

export default NotificationsCenterPage;
