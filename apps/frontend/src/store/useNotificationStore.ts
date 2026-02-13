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
import NotificationRecipientDto from '@libs/notification/types/notificationRecipient.dto';
import InboxResponseDto from '@libs/notification/types/inboxResponse.dto';
import notificationPaginationConfig from '@libs/notification/constants/notificationPaginationConfig';
import { NOTIFICATION_FILTER_TYPE, NotificationFilterType } from '@libs/notification/types/notificationFilterType';
import isNotificationType from '@libs/notification/utils/isNotificationType';
import handleApiError from '@/utils/handleApiError';

interface NotificationStore {
  notifications: InboxNotificationDto[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
  sentNotifications: InboxNotificationDto[];
  sentTotal: number;
  sentHasMore: boolean;
  recipients: NotificationRecipientDto[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isSentLoading: boolean;
  isSentLoadingMore: boolean;
  isLoadingRecipients: boolean;
  isUnreadCountLoading: boolean;
  isDeleting: boolean;
  isDeleteDialogOpen: boolean;
  isSheetOpen: boolean;
  error: string | null;

  fetchNotifications: (loadMore?: boolean) => Promise<void>;
  fetchSentNotifications: (loadMore?: boolean) => Promise<void>;
  fetchRecipients: (notificationId: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (userNotificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteSentNotification: (notificationId: string) => Promise<void>;
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
  sentNotifications: [] as InboxNotificationDto[],
  sentTotal: 0,
  sentHasMore: false,
  recipients: [] as NotificationRecipientDto[],
  isLoading: false,
  isSentLoading: false,
  isSentLoadingMore: false,
  isLoadingRecipients: false,
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

  fetchSentNotifications: async (loadMore = false) => {
    const { sentNotifications: existing } = get();
    const offset = loadMore ? existing.length : 0;

    set({ isSentLoading: !loadMore, isSentLoadingMore: loadMore, error: null });
    try {
      const { data } = await eduApi.get<InboxResponseDto>(`${NOTIFICATIONS_EDU_API_ENDPOINT}/sent`, {
        params: { limit: notificationPaginationConfig.PAGE_SIZE, offset },
      });

      const newNotifications = loadMore ? [...existing, ...data.notifications] : data.notifications;

      set({
        sentNotifications: newNotifications,
        sentTotal: data.total,
        sentHasMore: newNotifications.length < data.total,
      });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isSentLoading: false, isSentLoadingMore: false });
    }
  },

  fetchRecipients: async (notificationId: string) => {
    set({ isLoadingRecipients: true, recipients: [] });
    try {
      const { data } = await eduApi.get<NotificationRecipientDto[]>(
        `${NOTIFICATIONS_EDU_API_ENDPOINT}/sent/${notificationId}/recipients`,
      );
      set({ recipients: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoadingRecipients: false });
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

  markAsRead: async (userNotificationId: string) => {
    const { notifications, unreadCount } = get();
    const targetNotification = notifications.find((notification) => notification.id === userNotificationId);
    const wasUnread = targetNotification && !targetNotification.readAt;

    set({
      notifications: notifications.map((notification) =>
        notification.id === userNotificationId ? { ...notification, readAt: new Date() } : notification,
      ),
      unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount,
    });

    try {
      await eduApi.patch(`${NOTIFICATIONS_EDU_API_ENDPOINT}/${userNotificationId}`);
    } catch (error) {
      set({
        notifications,
        unreadCount,
      });
      handleApiError(error, set);
    }
  },

  markAllAsRead: async () => {
    const { notifications, unreadCount } = get();

    set({
      notifications: notifications.map((notification) => ({
        ...notification,
        readAt: notification.readAt ?? new Date(),
      })),
      unreadCount: 0,
    });

    try {
      await eduApi.patch(NOTIFICATIONS_EDU_API_ENDPOINT);
    } catch (error) {
      set({
        notifications,
        unreadCount,
      });
      handleApiError(error, set);
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      await eduApi.delete(`${NOTIFICATIONS_EDU_API_ENDPOINT}/${notificationId}`);
      const { notifications, total, unreadCount } = get();
      const notificationToDelete = notifications.find((notification) => notification.id === notificationId);
      set({
        notifications: notifications.filter((notification) => notification.id !== notificationId),
        total: Math.max(0, total - 1),
        unreadCount: notificationToDelete && !notificationToDelete.readAt ? Math.max(0, unreadCount - 1) : unreadCount,
      });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  deleteSentNotification: async (notificationId: string) => {
    try {
      await eduApi.delete(`${NOTIFICATIONS_EDU_API_ENDPOINT}/sent/${notificationId}`);
      const { sentNotifications, sentTotal } = get();
      set({
        sentNotifications: sentNotifications.filter((notification) => notification.id !== notificationId),
        sentTotal: Math.max(0, sentTotal - 1),
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
      let newNotifications = notifications;
      let newUnreadCount = unreadCount;

      if (type === NOTIFICATION_FILTER_TYPE.ALL) {
        newNotifications = [];
        newUnreadCount = 0;
      } else if (type === NOTIFICATION_FILTER_TYPE.SENT) {
        set({
          sentNotifications: [],
          sentTotal: 0,
          isDeleteDialogOpen: false,
        });
        toast.success(i18n.t('notificationscenter.deletedNotifications', { count: data.deletedCount }));
        return;
      } else if (isNotificationType(type)) {
        const deletedNotifications = notifications.filter((notification) => notification.type === type);
        newNotifications = notifications.filter((notification) => notification.type !== type);
        const deletedUnread = deletedNotifications.filter((notification) => !notification.readAt).length;
        newUnreadCount = Math.max(0, unreadCount - deletedUnread);
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
