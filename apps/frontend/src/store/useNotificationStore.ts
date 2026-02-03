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

import { create } from 'zustand';
import { toast } from 'sonner';
import i18n from '@/i18n';
import eduApi from '@/api/eduApi';
import { NOTIFICATIONS_EDU_API_ENDPOINT } from '@libs/notification/constants/apiEndpoints';
import InboxNotificationDto from '@libs/notification/types/inboxNotification.dto';
import InboxResponseDto from '@libs/notification/types/inboxResponse.dto';
import NOTIFICATION_TYPE from '@libs/notification/constants/notificationType';
import notificationPaginationConfig from '@libs/notification/constants/notificationPaginationConfig';
import { NOTIFICATION_FILTER_TYPE, NotificationFilterType } from '@libs/notification/types/notificationFilterType';
import handleApiError from '@/utils/handleApiError';

interface NotificationStore {
  notifications: InboxNotificationDto[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isUnreadCountLoading: boolean;
  isDeleting: boolean;
  isDeleteDialogOpen: boolean;
  isSheetOpen: boolean;
  error: string | null;

  fetchNotifications: (loadMore?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationIds?: string[]) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllByType: (type: NotificationFilterType) => Promise<void>;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  setIsSheetOpen: (isOpen: boolean) => void;
  reset: () => void;
}

const initialState = {
  notifications: [] as InboxNotificationDto[],
  total: 0,
  unreadCount: 0,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  isUnreadCountLoading: false,
  isDeleting: false,
  isDeleteDialogOpen: false,
  isSheetOpen: false,
  error: null,
};

const useNotificationStore = create<NotificationStore>((set, get) => ({
  ...initialState,

  fetchNotifications: async (loadMore = false) => {
    const { notifications: existing } = get();
    const offset = loadMore ? existing.length : 0;

    set({ isLoading: !loadMore, isLoadingMore: loadMore, error: null });
    try {
      const { data } = await eduApi.get<InboxResponseDto>(NOTIFICATIONS_EDU_API_ENDPOINT, {
        params: { limit: notificationPaginationConfig.PAGE_SIZE, offset },
      });

      const newNotifications = loadMore ? [...existing, ...data.notifications] : data.notifications;

      set({
        notifications: newNotifications,
        total: data.total,
        hasMore: newNotifications.length < data.total,
      });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false, isLoadingMore: false });
    }
  },

  fetchUnreadCount: async () => {
    set({ isUnreadCountLoading: true });
    try {
      const { data } = await eduApi.get<{ count: number }>(`${NOTIFICATIONS_EDU_API_ENDPOINT}/unread-count`);
      set({ unreadCount: data.count });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isUnreadCountLoading: false });
    }
  },

  markAsRead: async (notificationIds?: string[]) => {
    try {
      await eduApi.patch(`${NOTIFICATIONS_EDU_API_ENDPOINT}/read`, {
        ids: notificationIds,
      });

      const { notifications, unreadCount } = get();

      if (notificationIds?.length) {
        const idsSet = new Set(notificationIds);
        const markedCount = notifications.filter((n) => idsSet.has(n.id) && !n.readAt).length;

        set({
          notifications: notifications.map((notification) =>
            idsSet.has(notification.id) ? { ...notification, readAt: new Date() } : notification,
          ),
          unreadCount: Math.max(0, unreadCount - markedCount),
        });
      } else {
        set({
          notifications: notifications.map((notification) => ({
            ...notification,
            readAt: notification.readAt ?? new Date(),
          })),
          unreadCount: 0,
        });
      }
    } catch (error) {
      handleApiError(error, set);
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      await eduApi.delete(`${NOTIFICATIONS_EDU_API_ENDPOINT}/${notificationId}`);
      const { notifications, total, unreadCount } = get();
      const notificationToDelete = notifications.find((n) => n.id === notificationId);
      set({
        notifications: notifications.filter((notification) => notification.id !== notificationId),
        total: Math.max(0, total - 1),
        unreadCount: notificationToDelete && !notificationToDelete.readAt ? Math.max(0, unreadCount - 1) : unreadCount,
      });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  deleteAllByType: async (type: NotificationFilterType) => {
    set({ isDeleting: true, error: null });
    try {
      const { data } = await eduApi.delete<{ deletedCount: number }>(NOTIFICATIONS_EDU_API_ENDPOINT, {
        params: { type },
      });

      const { notifications, unreadCount, total } = get();
      let newNotifications: InboxNotificationDto[];
      let newUnreadCount = unreadCount;

      if (type === NOTIFICATION_FILTER_TYPE.ALL) {
        newNotifications = [];
        newUnreadCount = 0;
      } else {
        const typeToFilter = type === NOTIFICATION_FILTER_TYPE.USER ? NOTIFICATION_TYPE.USER : NOTIFICATION_TYPE.SYSTEM;
        const deletedNotifications = notifications.filter((n) => n.type === typeToFilter);
        newNotifications = notifications.filter((n) => n.type !== typeToFilter);

        if (type === NOTIFICATION_FILTER_TYPE.USER) {
          const deletedUnread = deletedNotifications.filter((n) => !n.readAt).length;
          newUnreadCount = Math.max(0, unreadCount - deletedUnread);
        }
      }

      set({
        notifications: newNotifications,
        total: Math.max(0, total - data.deletedCount),
        unreadCount: newUnreadCount,
        isDeleteDialogOpen: false,
      });

      toast.success(i18n.t('notificationscenter.deletedNotifications', { count: data.deletedCount }));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isDeleting: false });
    }
  },

  setIsDeleteDialogOpen: (isOpen: boolean) => set({ isDeleteDialogOpen: isOpen }),

  setIsSheetOpen: (isOpen: boolean) => set({ isSheetOpen: isOpen }),

  reset: () => set(initialState),
}));

export default useNotificationStore;
