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

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble, faRotate, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import useNotificationStore from '@/store/useNotificationStore';
import useMedia from '@/hooks/useMedia';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';
import { NOTIFICATION_FILTER_TYPE, NotificationFilterType } from '@libs/notification/types/notificationFilterType';
import canFilterByNotificationType from '@libs/notification/utils/canFilterByNotificationType';
import cn from '@libs/common/utils/className';
import NotificationList from '@/pages/NotificationsCenter/components/NotificationList';
import NotificationFilterBadges from '@/pages/NotificationsCenter/components/NotificationFilterBadges';
import DeleteAllNotificationsDialog from '@/pages/NotificationsCenter/components/DeleteAllNotificationsDialog';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import { Button } from '@/components/shared/Button';

const NotificationPanel = () => {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    isSheetOpen,
    setIsSheetOpen,
    setIsDeleteDialogOpen,
  } = useNotificationStore();

  const { isMobileView, isTabletView } = useMedia();
  const isEdulutionApp = usePlatformStore((state) => state.isEdulutionApp);
  const isMobileOrTablet = isMobileView || isTabletView || isEdulutionApp;

  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>(NOTIFICATION_FILTER_TYPE.ALL);

  useEffect(() => {
    if (isSheetOpen) {
      void fetchNotifications();
      void fetchUnreadCount();
    }
  }, [isSheetOpen, fetchNotifications, fetchUnreadCount]);

  const filteredNotifications = useMemo(() => {
    if (canFilterByNotificationType(activeFilter)) {
      return notifications.filter((notification) => notification.type === activeFilter);
    }
    return notifications;
  }, [notifications, activeFilter]);

  const handleRefresh = () => {
    void fetchNotifications();
    void fetchUnreadCount();
  };

  const handleMarkAllAsRead = () => {
    void markAllAsRead();
  };

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={setIsSheetOpen}
    >
      <SheetContent
        side={isMobileOrTablet ? 'bottom' : 'right'}
        overlayClassName="bg-transparent z-[998]"
        className={cn(
          'bg-glass z-[999] flex flex-col border-muted text-background shadow-xl shadow-slate-400 backdrop-blur-md',
          isMobileOrTablet ? 'max-h-[85vh] rounded-t-2xl border-t' : 'max-h-full border-l sm:max-w-md',
          !isMobileOrTablet && 'right-[var(--sidebar-width)]',
        )}
      >
        <SheetHeader>
          <SheetTitle className="text-left text-xl font-bold text-background">
            {t('notificationscenter.appTitle')}
          </SheetTitle>
          <SheetDescription>{t('notificationscenter.description')}</SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            className="rounded-full p-2 text-background transition-colors hover:hover:bg-muted-background hover:text-background"
            title={t('common.reload')}
          >
            <FontAwesomeIcon
              icon={faRotate}
              className="h-4 w-4"
            />
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              className="rounded-full p-2 text-background transition-colors hover:hover:bg-muted-background hover:text-background"
              title={t('notificationscenter.markAllAsRead')}
            >
              <FontAwesomeIcon
                icon={faCheckDouble}
                className="h-4 w-4"
              />
            </Button>
          )}
          {filteredNotifications.length > 0 && (
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="rounded-full p-2 text-background transition-colors hover:hover:bg-muted-background hover:text-destructive"
              title={t('notificationscenter.deleteAll')}
            >
              <FontAwesomeIcon
                icon={faTrash}
                className="h-4 w-4"
              />
            </Button>
          )}
        </div>

        <NotificationFilterBadges
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          notifications={notifications}
        />

        <div className="min-h-0 flex-1">
          {isLoading && <LoadingIndicatorDialog isOpen />}
          {!isLoading && (
            <NotificationList
              notifications={filteredNotifications}
              className="pb-4"
            />
          )}
        </div>

        <DeleteAllNotificationsDialog
          deleteType={activeFilter}
          notificationCount={filteredNotifications.length}
        />
      </SheetContent>
    </Sheet>
  );
};

export default NotificationPanel;
