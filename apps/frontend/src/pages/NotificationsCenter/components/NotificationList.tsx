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
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInbox } from '@fortawesome/free-solid-svg-icons';
import InboxNotificationDto from '@libs/notification/types/inboxNotification.dto';
import NotificationItem from '@/pages/NotificationsCenter/components/NotificationItem';

interface NotificationListProps {
  notifications: InboxNotificationDto[];
}

const NotificationList = ({ notifications }: NotificationListProps) => {
  const { t } = useTranslation();

  if (notifications.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <FontAwesomeIcon
            icon={faInbox}
            className="h-12 w-12"
          />
          <span className="text-lg">{t('notificationscenter.noNotifications')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pb-20 scrollbar-thin">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
};

export default NotificationList;
