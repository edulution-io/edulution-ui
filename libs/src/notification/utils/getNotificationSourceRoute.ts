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

import NotificationSourceType from '@libs/notification/types/notificationSourceType';
import NOTIFICATION_SOURCE_TYPE from '@libs/notification/constants/notificationSourceType';
import SOURCE_TYPE_TO_APP from '@libs/notification/constants/sourceTypeToApp';
import DEEP_LINK_SOURCE_TYPES from '@libs/notification/constants/deepLinkSourceTypes';
import toChatRoute from '@libs/chat/utils/toChatRoute';

const getNotificationSourceRoute = (sourceType?: NotificationSourceType, sourceId?: string): string | undefined => {
  if (!sourceType) {
    return undefined;
  }
  const app = SOURCE_TYPE_TO_APP[sourceType];
  if (!app) {
    return undefined;
  }
  if (sourceId && DEEP_LINK_SOURCE_TYPES.includes(sourceType)) {
    const resolvedSourceId = sourceType === NOTIFICATION_SOURCE_TYPE.CHAT ? toChatRoute(sourceId) : sourceId;
    return `/${app}/${resolvedSourceId}`;
  }
  return `/${app}`;
};

export default getNotificationSourceRoute;
