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
import { Button, cn } from '@edulution-io/ui-kit';
import { NOTIFICATION_FILTER_TYPE, NotificationFilterType } from '@libs/notification/types/notificationFilterType';
import isNotificationType from '@libs/notification/utils/isNotificationType';
import InboxNotificationDto from '@libs/notification/types/inboxNotification.dto';

interface NotificationFilterBadgesProps {
  activeFilter: NotificationFilterType;
  onFilterChange: (filter: NotificationFilterType) => void;
  notifications: InboxNotificationDto[];
  sentCount: number;
}

const FILTERS = [
  { key: NOTIFICATION_FILTER_TYPE.ALL, labelKey: 'notificationscenter.menu.all' },
  { key: NOTIFICATION_FILTER_TYPE.USER, labelKey: 'notificationscenter.menu.messages' },
  { key: NOTIFICATION_FILTER_TYPE.SYSTEM, labelKey: 'notificationscenter.menu.system' },
] as const;

const SENT_FILTER = { key: NOTIFICATION_FILTER_TYPE.SENT, labelKey: 'notificationscenter.menu.sent' } as const;

const getFilterCount = (
  filter: NotificationFilterType,
  notifications: InboxNotificationDto[],
  sentCount: number,
): number => {
  if (filter === NOTIFICATION_FILTER_TYPE.SENT) {
    return sentCount;
  }
  if (isNotificationType(filter)) {
    return notifications.filter((notification) => notification.type === filter).length;
  }
  return notifications.length;
};

const NotificationFilterBadges = ({
  activeFilter,
  onFilterChange,
  notifications,
  sentCount,
}: NotificationFilterBadgesProps) => {
  const { t } = useTranslation();

  const filtersToShow = sentCount > 0 ? [...FILTERS, SENT_FILTER] : FILTERS;

  return (
    <div className="flex gap-2">
      {filtersToShow.map(({ key, labelKey }) => {
        const isActive = activeFilter === key;
        const count = getFilterCount(key, notifications, sentCount);

        return (
          <Button
            key={key}
            type="button"
            variant="btn-ghost"
            className={cn(
              'rounded-lg px-2 py-1 text-sm font-medium',
              isActive
                ? 'hover:bg-primary/90 bg-primary px-3 text-white'
                : 'bg-muted-foreground/10 text-background hover:bg-muted-background',
            )}
            onClick={() => onFilterChange(key)}
          >
            {t(labelKey)} ({count})
          </Button>
        );
      })}
    </div>
  );
};

export default NotificationFilterBadges;
