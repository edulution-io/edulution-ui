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
import { faInbox, faSpinner } from '@fortawesome/free-solid-svg-icons';
import InboxNotificationDto from '@libs/notification/types/inboxNotification.dto';
import { Button, cn } from '@edulution-io/ui-kit';
import NotificationItem from '@/pages/NotificationsCenter/components/NotificationItem';
import useNotificationStore from '@/store/useNotificationStore';

interface NotificationListProps {
  notifications: InboxNotificationDto[];
  className?: string;
  isSentView?: boolean;
  emptyMessage?: string;
}

const NotificationList = ({ notifications, className, isSentView = false, emptyMessage }: NotificationListProps) => {
  const { t } = useTranslation();
  const { hasMore, sentHasMore, isLoadingMore, fetchNotifications, fetchSentNotifications } = useNotificationStore();

  const currentHasMore = isSentView ? sentHasMore : hasMore;

  const handleLoadMore = () => {
    if (isSentView) {
      void fetchSentNotifications(true);
    } else {
      void fetchNotifications(true);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <FontAwesomeIcon
            icon={faInbox}
            className="h-12 w-12"
          />
          <span className="text-lg">{emptyMessage ?? t('notificationscenter.noNotifications')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col gap-3 overflow-y-auto px-2 pb-20 pt-4 scrollbar-thin', className)}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          isSentView={isSentView}
        />
      ))}
      {currentHasMore && (
        <Button
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="mt-2 w-full"
        >
          {isLoadingMore ? (
            <>
              <FontAwesomeIcon
                icon={faSpinner}
                className="mr-2 h-4 w-4 animate-spin"
              />
              {t('common.loading')}
            </>
          ) : (
            t('notificationscenter.loadMore')
          )}
        </Button>
      )}
    </div>
  );
};

export default NotificationList;
