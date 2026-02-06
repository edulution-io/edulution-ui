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
import cn from '@libs/common/utils/className';
import NOTIFICATION_COUNTER_VARIANT from '@libs/notification/constants/notificationCounterVariant';
import NotificationCounterVariant from '@libs/notification/types/notificationCounterVariant';

interface SidebarItemNotificationProps {
  count: number;
  maxCount?: number;
  variant?: NotificationCounterVariant;
  className?: string;
}

const NotificationCounter = (props: SidebarItemNotificationProps) => {
  const { count, maxCount = 9, variant = NOTIFICATION_COUNTER_VARIANT.APP_NOTIFICATION, className } = props;

  if (!count || count === 0) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : `${count}`;

  return (
    <span
      className={cn(
        'absolute inline-flex h-5 min-w-[1.25rem] transform items-center justify-center rounded-full px-0 text-xs font-bold text-white',
        variant,
        className ?? 'right-[10px] top-[2px]',
      )}
      aria-label={`${displayCount} new notifications`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationCounter;
