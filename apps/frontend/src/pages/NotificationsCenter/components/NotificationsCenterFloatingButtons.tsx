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

import React from 'react';
import { t } from 'i18next';
import { faCheckDouble, faRotate, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NOTIFICATION_FILTER_TYPE, NotificationFilterType } from '@libs/notification/types/notificationFilterType';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import useNotificationStore from '@/store/useNotificationStore';
import DeleteAllNotificationsDialog from './DeleteAllNotificationsDialog';

interface NotificationscenterFloatingButtonsProps {
  deleteType: NotificationFilterType;
  notificationCount: number;
}

const NotificationsCenterFloatingButtons = ({
  deleteType,
  notificationCount,
}: NotificationscenterFloatingButtonsProps) => {
  const { unreadCount, markAllAsRead, fetchNotifications, fetchUnreadCount, setIsDeleteDialogOpen } =
    useNotificationStore();

  const handleMarkAllAsRead = () => {
    void markAllAsRead();
  };

  const handleRefresh = () => {
    void fetchNotifications();
    void fetchUnreadCount();
  };

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const getDeleteButtonText = () => {
    switch (deleteType) {
      case NOTIFICATION_FILTER_TYPE.USER:
        return t('notificationscenter.deleteAllMessages');
      case NOTIFICATION_FILTER_TYPE.SYSTEM:
        return t('notificationscenter.deleteAllSystem');
      default:
        return t('notificationscenter.deleteAll');
    }
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        icon: faRotate,
        text: t('common.reload'),
        onClick: handleRefresh,
      },
      {
        icon: faCheckDouble,
        text: t('notificationscenter.markAllAsRead'),
        onClick: handleMarkAllAsRead,
        isVisible: unreadCount > 0,
      },
      {
        icon: faTrash,
        text: getDeleteButtonText(),
        onClick: handleOpenDeleteDialog,
        isVisible: notificationCount > 0,
      },
    ],
    keyPrefix: 'notificationscenter-floating-button_',
  };

  return (
    <>
      <FloatingButtonsBar config={config} />
      <DeleteAllNotificationsDialog
        deleteType={deleteType}
        notificationCount={notificationCount}
      />
    </>
  );
};

export default NotificationsCenterFloatingButtons;
