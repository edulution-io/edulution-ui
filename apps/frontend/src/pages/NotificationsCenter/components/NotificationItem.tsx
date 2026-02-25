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

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faTrash,
  faCheck,
  faChevronDown,
  faChevronUp,
  faBullhorn,
  faChartBar,
  faVideo,
  faComment,
  faCircleInfo,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Button, cn } from '@edulution-io/ui-kit';
import { Card } from '@/components/shared/Card/Card';
import InboxNotificationDto from '@libs/notification/types/inboxNotification.dto';
import NOTIFICATION_TYPE from '@libs/notification/constants/notificationType';
import NOTIFICATION_SOURCE_TYPE from '@libs/notification/constants/notificationSourceType';
import NotificationSourceType from '@libs/notification/types/notificationSourceType';
import getNotificationSourceRoute from '@libs/notification/utils/getNotificationSourceRoute';
import { getElapsedTime } from '@/pages/FileSharing/utilities/filesharingUtilities';
import useNotificationStore from '@/store/useNotificationStore';

interface NotificationItemProps {
  notification: InboxNotificationDto;
  isSentView?: boolean;
  onShowRecipients?: (notificationId: string, title: string) => void;
}

const getSourceTypeIcon = (sourceType?: NotificationSourceType): IconDefinition => {
  switch (sourceType) {
    case NOTIFICATION_SOURCE_TYPE.BULLETIN:
      return faBullhorn;
    case NOTIFICATION_SOURCE_TYPE.SURVEY:
      return faChartBar;
    case NOTIFICATION_SOURCE_TYPE.CONFERENCE:
      return faVideo;
    case NOTIFICATION_SOURCE_TYPE.CHAT:
      return faComment;
    case NOTIFICATION_SOURCE_TYPE.MAIL:
      return faEnvelope;
    default:
      return faBullhorn;
  }
};

const NotificationItem = ({ notification, isSentView = false, onShowRecipients }: NotificationItemProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { markAsRead, deleteNotification, deleteSentNotification, setIsSheetOpen } = useNotificationStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const isUserNotification = notification.type === NOTIFICATION_TYPE.USER;
  const isUnread = !isSentView && !notification.readAt;
  const hasContent = Boolean(notification.content);
  const sourceIcon = getSourceTypeIcon(notification.sourceType);
  const elapsedTime = getElapsedTime(notification.updatedAt);
  const sourceRoute = getNotificationSourceRoute(notification.sourceType, notification.sourceId);

  const handleClick = useCallback(() => {
    if (isSentView) {
      if (hasContent) {
        setIsExpanded((prev) => !prev);
      }
      return;
    }
    if (isUnread) {
      void markAsRead(notification.id);
    }
    if (sourceRoute) {
      setIsSheetOpen(false);
      navigate(sourceRoute);
    } else if (hasContent) {
      setIsExpanded((prev) => !prev);
    }
  }, [hasContent, isSentView, isUnread, markAsRead, notification.id, sourceRoute, setIsSheetOpen, navigate]);

  const handleMarkAsRead = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      void markAsRead(notification.id);
    },
    [markAsRead, notification.id],
  );

  const handleDelete = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (isSentView) {
        void deleteSentNotification(notification.id);
      } else {
        void deleteNotification(notification.id);
      }
    },
    [deleteNotification, deleteSentNotification, isSentView, notification.id],
  );

  const handleOpenRecipientsDialog = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onShowRecipients?.(notification.notificationId, notification.title);
    },
    [onShowRecipients, notification.notificationId, notification.title],
  );

  return (
    <Card
      role="button"
      tabIndex={0}
      variant={isUnread ? 'gridSelected' : 'grid'}
      className={cn('relative flex flex-col p-4', {
        'border-primary/50 ring-primary/30 ring-1': isUnread,
      })}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          handleClick();
        } else if (event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full', {
            'bg-primary/10': isUserNotification,
            'bg-muted-foreground/10': !isUserNotification,
          })}
        >
          <FontAwesomeIcon
            icon={sourceIcon}
            className={cn('h-5 w-5', {
              'text-primary': isUserNotification,
              'text-muted-foreground': !isUserNotification,
            })}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isUnread && (
              <FontAwesomeIcon
                icon={faCircle}
                className="h-2 w-2 flex-shrink-0 text-primary"
              />
            )}
            <h3 className="truncate text-base font-semibold text-background">{notification.title}</h3>
          </div>
          <p className="text-background/80 mt-0.5 line-clamp-2 text-sm">{notification.pushNotification}</p>
          <div className="mt-2 text-xs text-muted-foreground">{elapsedTime}</div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          {isSentView && (
            <Button
              type="button"
              className="hover:bg-primary/10 rounded-full p-2 text-muted-foreground hover:text-primary"
              onClick={handleOpenRecipientsDialog}
              title={t('notificationscenter.showRecipients')}
            >
              <FontAwesomeIcon
                icon={faCircleInfo}
                className="h-4 w-4"
              />
            </Button>
          )}
          {isUnread && !isSentView && (
            <Button
              type="button"
              className="hover:bg-primary/10 rounded-full p-2 text-muted-foreground hover:text-primary"
              onClick={handleMarkAsRead}
              title={t('notificationscenter.markAsRead')}
            >
              <FontAwesomeIcon
                icon={faCheck}
                className="h-4 w-4"
              />
            </Button>
          )}
          <Button
            type="button"
            className="hover:bg-destructive/10 rounded-full p-2 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            title={t('common.delete')}
          >
            <FontAwesomeIcon
              icon={faTrash}
              className="h-4 w-4"
            />
          </Button>
          {hasContent && (
            <FontAwesomeIcon
              icon={isExpanded ? faChevronUp : faChevronDown}
              className="ml-1 h-4 w-4 text-muted-foreground"
            />
          )}
        </div>
      </div>

      {isExpanded && notification.content && (
        <div className="border-muted-foreground/20 mt-3 border-t pt-3">
          <p className="text-background/90 whitespace-pre-wrap text-sm">{notification.content}</p>
        </div>
      )}
    </Card>
  );
};

export default NotificationItem;
