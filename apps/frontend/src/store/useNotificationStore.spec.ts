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

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));

import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import useNotificationStore from './useNotificationStore';

const createNotification = (overrides = {}) => ({
  id: 'notif-1',
  notificationId: 'msg-1',
  type: 'user',
  title: 'Test Notification',
  pushNotification: 'You have a message',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin',
  readAt: null,
  ...overrides,
});

const mockNotifications = [
  createNotification({ id: 'notif-1', notificationId: 'msg-1' }),
  createNotification({ id: 'notif-2', notificationId: 'msg-2', readAt: new Date().toISOString() }),
  createNotification({ id: 'notif-3', notificationId: 'msg-3', type: 'system' }),
];

const initialStoreState = useNotificationStore.getState();

describe('useNotificationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotificationStore.setState(initialStoreState, true);
  });

  describe('fetchNotifications', () => {
    it('fetches and stores notifications on success', async () => {
      server.use(
        http.get('/edu-api/notifications', () => HttpResponse.json({ notifications: mockNotifications, total: 3 })),
      );

      await useNotificationStore.getState().fetchNotifications();

      expect(useNotificationStore.getState().notifications).toHaveLength(3);
      expect(useNotificationStore.getState().total).toBe(3);
      expect(useNotificationStore.getState().hasMore).toBe(false);
      expect(useNotificationStore.getState().isLoading).toBe(false);
    });

    it('appends notifications when loadMore is true', async () => {
      useNotificationStore.setState({
        notifications: [createNotification({ id: 'existing-1' })] as never,
        total: 3,
      });

      server.use(
        http.get('/edu-api/notifications', () =>
          HttpResponse.json({ notifications: [createNotification({ id: 'new-1' })], total: 3 }),
        ),
      );

      await useNotificationStore.getState().fetchNotifications(true);

      expect(useNotificationStore.getState().notifications).toHaveLength(2);
      expect(useNotificationStore.getState().hasMore).toBe(true);
    });

    it('sets hasMore to true when not all notifications loaded', async () => {
      server.use(
        http.get('/edu-api/notifications', () =>
          HttpResponse.json({ notifications: [createNotification()], total: 50 }),
        ),
      );

      await useNotificationStore.getState().fetchNotifications();

      expect(useNotificationStore.getState().hasMore).toBe(true);
    });

    it('sets error on failure', async () => {
      server.use(
        http.get('/edu-api/notifications', () =>
          HttpResponse.json({ message: 'fetch.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useNotificationStore.getState().fetchNotifications();

      expect(useNotificationStore.getState().error).toBeTruthy();
      expect(useNotificationStore.getState().isLoading).toBe(false);
    });

    it('sets isLoading during initial fetch and isLoadingMore during pagination', async () => {
      let resolveRequest: () => void;
      const pending = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });

      server.use(
        http.get('/edu-api/notifications', async () => {
          await pending;
          return HttpResponse.json({ notifications: [], total: 0 });
        }),
      );

      const promise = useNotificationStore.getState().fetchNotifications();
      expect(useNotificationStore.getState().isLoading).toBe(true);
      expect(useNotificationStore.getState().isLoadingMore).toBe(false);
      resolveRequest!();
      await promise;

      const pendingMore = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });

      server.use(
        http.get('/edu-api/notifications', async () => {
          await pendingMore;
          return HttpResponse.json({ notifications: [], total: 0 });
        }),
      );

      const loadMorePromise = useNotificationStore.getState().fetchNotifications(true);
      expect(useNotificationStore.getState().isLoading).toBe(false);
      expect(useNotificationStore.getState().isLoadingMore).toBe(true);
      resolveRequest!();
      await loadMorePromise;
    });
  });

  describe('fetchSentNotifications', () => {
    it('fetches and stores sent notifications on success', async () => {
      server.use(
        http.get('/edu-api/notifications/sent', () =>
          HttpResponse.json({ notifications: mockNotifications, total: 3 }),
        ),
      );

      await useNotificationStore.getState().fetchSentNotifications();

      expect(useNotificationStore.getState().sentNotifications).toHaveLength(3);
      expect(useNotificationStore.getState().sentTotal).toBe(3);
      expect(useNotificationStore.getState().isSentLoading).toBe(false);
    });

    it('appends sent notifications when loadMore is true', async () => {
      useNotificationStore.setState({
        sentNotifications: [createNotification({ id: 'existing-sent' })] as never,
        sentTotal: 3,
      });

      server.use(
        http.get('/edu-api/notifications/sent', () =>
          HttpResponse.json({ notifications: [createNotification({ id: 'new-sent' })], total: 3 }),
        ),
      );

      await useNotificationStore.getState().fetchSentNotifications(true);

      expect(useNotificationStore.getState().sentNotifications).toHaveLength(2);
    });

    it('sets error on failure', async () => {
      server.use(
        http.get('/edu-api/notifications/sent', () =>
          HttpResponse.json({ message: 'sent.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useNotificationStore.getState().fetchSentNotifications();

      expect(useNotificationStore.getState().error).toBeTruthy();
      expect(useNotificationStore.getState().isSentLoading).toBe(false);
    });
  });

  describe('fetchRecipients', () => {
    it('fetches and stores recipients on success', async () => {
      const mockRecipients = [
        { username: 'alice', readAt: null },
        { username: 'bob', readAt: new Date().toISOString() },
      ];

      server.use(
        http.get('/edu-api/notifications/sent/:notificationId/recipients', () => HttpResponse.json(mockRecipients)),
      );

      await useNotificationStore.getState().fetchRecipients('msg-1');

      expect(useNotificationStore.getState().recipients).toHaveLength(2);
      expect(useNotificationStore.getState().isLoadingRecipients).toBe(false);
    });

    it('clears recipients before fetching', async () => {
      useNotificationStore.setState({
        recipients: [{ username: 'old', readAt: null }] as never,
      });

      server.use(http.get('/edu-api/notifications/sent/:notificationId/recipients', () => HttpResponse.json([])));

      await useNotificationStore.getState().fetchRecipients('msg-1');

      expect(useNotificationStore.getState().recipients).toEqual([]);
    });

    it('sets error on failure', async () => {
      server.use(
        http.get('/edu-api/notifications/sent/:notificationId/recipients', () =>
          HttpResponse.json({ message: 'recipients.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useNotificationStore.getState().fetchRecipients('msg-1');

      expect(useNotificationStore.getState().error).toBeTruthy();
      expect(useNotificationStore.getState().isLoadingRecipients).toBe(false);
    });
  });

  describe('fetchUnreadCount', () => {
    it('fetches and stores unread count on success', async () => {
      server.use(http.get('/edu-api/notifications/unread-count', () => HttpResponse.json({ count: 5 })));

      await useNotificationStore.getState().fetchUnreadCount();

      expect(useNotificationStore.getState().unreadCount).toBe(5);
      expect(useNotificationStore.getState().isUnreadCountLoading).toBe(false);
    });

    it('sets error on failure', async () => {
      server.use(
        http.get('/edu-api/notifications/unread-count', () =>
          HttpResponse.json({ message: 'unread.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useNotificationStore.getState().fetchUnreadCount();

      expect(useNotificationStore.getState().error).toBeTruthy();
      expect(useNotificationStore.getState().isUnreadCountLoading).toBe(false);
    });
  });

  describe('markAsRead', () => {
    it('optimistically marks notification as read and decrements unreadCount', async () => {
      useNotificationStore.setState({
        notifications: [
          createNotification({ id: 'notif-1', readAt: null }),
          createNotification({ id: 'notif-2', readAt: new Date().toISOString() }),
        ] as never,
        unreadCount: 2,
      });

      server.use(http.patch('/edu-api/notifications/:id', () => new HttpResponse(null, { status: 200 })));

      await useNotificationStore.getState().markAsRead('notif-1');

      const state = useNotificationStore.getState();
      expect(state.notifications.find((n) => n.id === 'notif-1')?.readAt).toBeTruthy();
      expect(state.unreadCount).toBe(1);
    });

    it('does not decrement unreadCount for already-read notifications', async () => {
      useNotificationStore.setState({
        notifications: [createNotification({ id: 'notif-1', readAt: new Date().toISOString() })] as never,
        unreadCount: 2,
      });

      server.use(http.patch('/edu-api/notifications/:id', () => new HttpResponse(null, { status: 200 })));

      await useNotificationStore.getState().markAsRead('notif-1');

      expect(useNotificationStore.getState().unreadCount).toBe(2);
    });

    it('rolls back on error', async () => {
      const originalNotifications = [createNotification({ id: 'notif-1', readAt: null })] as never[];

      useNotificationStore.setState({
        notifications: originalNotifications,
        unreadCount: 1,
      });

      server.use(
        http.patch('/edu-api/notifications/:id', () =>
          HttpResponse.json({ message: 'mark.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useNotificationStore.getState().markAsRead('notif-1');

      const state = useNotificationStore.getState();
      expect(state.notifications[0].readAt).toBeNull();
      expect(state.unreadCount).toBe(1);
    });
  });

  describe('markAllAsRead', () => {
    it('optimistically marks all notifications as read and sets unreadCount to 0', async () => {
      useNotificationStore.setState({
        notifications: [
          createNotification({ id: 'notif-1', readAt: null }),
          createNotification({ id: 'notif-2', readAt: null }),
        ] as never,
        unreadCount: 2,
      });

      server.use(http.patch('/edu-api/notifications', () => new HttpResponse(null, { status: 200 })));

      await useNotificationStore.getState().markAllAsRead();

      const state = useNotificationStore.getState();
      expect(state.notifications.every((n) => n.readAt !== null)).toBe(true);
      expect(state.unreadCount).toBe(0);
    });

    it('rolls back on error', async () => {
      const originalNotifications = [
        createNotification({ id: 'notif-1', readAt: null }),
        createNotification({ id: 'notif-2', readAt: null }),
      ] as never[];

      useNotificationStore.setState({
        notifications: originalNotifications,
        unreadCount: 2,
      });

      server.use(
        http.patch('/edu-api/notifications', () =>
          HttpResponse.json({ message: 'markAll.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useNotificationStore.getState().markAllAsRead();

      const state = useNotificationStore.getState();
      expect(state.notifications[0].readAt).toBeNull();
      expect(state.notifications[1].readAt).toBeNull();
      expect(state.unreadCount).toBe(2);
    });
  });

  describe('deleteNotification', () => {
    it('removes notification and adjusts total on success', async () => {
      useNotificationStore.setState({
        notifications: mockNotifications as never,
        total: 3,
        unreadCount: 2,
      });

      server.use(http.delete('/edu-api/notifications/:id', () => new HttpResponse(null, { status: 200 })));

      await useNotificationStore.getState().deleteNotification('notif-1');

      expect(useNotificationStore.getState().notifications).toHaveLength(2);
      expect(useNotificationStore.getState().total).toBe(2);
      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it('does not decrement unreadCount when deleting a read notification', async () => {
      useNotificationStore.setState({
        notifications: mockNotifications as never,
        total: 3,
        unreadCount: 2,
      });

      server.use(http.delete('/edu-api/notifications/:id', () => new HttpResponse(null, { status: 200 })));

      await useNotificationStore.getState().deleteNotification('notif-2');

      expect(useNotificationStore.getState().unreadCount).toBe(2);
    });

    it('sets error on failure', async () => {
      useNotificationStore.setState({
        notifications: mockNotifications as never,
        total: 3,
      });

      server.use(
        http.delete('/edu-api/notifications/:id', () =>
          HttpResponse.json({ message: 'delete.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useNotificationStore.getState().deleteNotification('notif-1');

      expect(useNotificationStore.getState().notifications).toHaveLength(3);
      expect(useNotificationStore.getState().error).toBeTruthy();
    });
  });

  describe('deleteSentNotification', () => {
    it('removes sent notification and adjusts sentTotal on success', async () => {
      useNotificationStore.setState({
        sentNotifications: mockNotifications as never,
        sentTotal: 3,
      });

      server.use(http.delete('/edu-api/notifications/sent/:id', () => new HttpResponse(null, { status: 200 })));

      await useNotificationStore.getState().deleteSentNotification('notif-1');

      expect(useNotificationStore.getState().sentNotifications).toHaveLength(2);
      expect(useNotificationStore.getState().sentTotal).toBe(2);
    });

    it('sets error on failure', async () => {
      useNotificationStore.setState({
        sentNotifications: mockNotifications as never,
        sentTotal: 3,
      });

      server.use(
        http.delete('/edu-api/notifications/sent/:id', () =>
          HttpResponse.json({ message: 'deleteSent.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useNotificationStore.getState().deleteSentNotification('notif-1');

      expect(useNotificationStore.getState().sentNotifications).toHaveLength(3);
      expect(useNotificationStore.getState().error).toBeTruthy();
    });
  });

  describe('deleteAllByType', () => {
    it('clears all notifications when type is all', async () => {
      useNotificationStore.setState({
        notifications: mockNotifications as never,
        total: 3,
        unreadCount: 2,
      });

      server.use(http.delete('/edu-api/notifications', () => HttpResponse.json({ deletedCount: 3 })));

      await useNotificationStore.getState().deleteAllByType('all');

      expect(useNotificationStore.getState().notifications).toEqual([]);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
      expect(useNotificationStore.getState().total).toBe(0);
      expect(useNotificationStore.getState().isDeleteDialogOpen).toBe(false);
      expect(useNotificationStore.getState().isDeleting).toBe(false);
    });

    it('clears sent notifications when type is sent', async () => {
      useNotificationStore.setState({
        sentNotifications: mockNotifications as never,
        sentTotal: 3,
      });

      server.use(http.delete('/edu-api/notifications', () => HttpResponse.json({ deletedCount: 3 })));

      await useNotificationStore.getState().deleteAllByType('sent');

      expect(useNotificationStore.getState().sentNotifications).toEqual([]);
      expect(useNotificationStore.getState().sentTotal).toBe(0);
      expect(useNotificationStore.getState().isDeleteDialogOpen).toBe(false);
    });

    it('removes only matching type notifications', async () => {
      useNotificationStore.setState({
        notifications: mockNotifications as never,
        total: 3,
        unreadCount: 2,
      });

      server.use(http.delete('/edu-api/notifications', () => HttpResponse.json({ deletedCount: 1 })));

      await useNotificationStore.getState().deleteAllByType('system');

      const state = useNotificationStore.getState();
      expect(state.notifications).toHaveLength(2);
      expect(state.notifications.every((n) => n.type !== 'system')).toBe(true);
      expect(state.total).toBe(2);
      expect(state.isDeleteDialogOpen).toBe(false);
    });

    it('sets error on failure', async () => {
      server.use(
        http.delete('/edu-api/notifications', () =>
          HttpResponse.json({ message: 'deleteAll.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useNotificationStore.getState().deleteAllByType('all');

      expect(useNotificationStore.getState().error).toBeTruthy();
      expect(useNotificationStore.getState().isDeleting).toBe(false);
    });

    it('sets isDeleting during request', async () => {
      let resolveRequest: () => void;
      const pending = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });

      server.use(
        http.delete('/edu-api/notifications', async () => {
          await pending;
          return HttpResponse.json({ deletedCount: 0 });
        }),
      );

      const promise = useNotificationStore.getState().deleteAllByType('all');
      expect(useNotificationStore.getState().isDeleting).toBe(true);
      resolveRequest!();
      await promise;
      expect(useNotificationStore.getState().isDeleting).toBe(false);
    });
  });

  describe('setIsDeleteDialogOpen', () => {
    it('updates isDeleteDialogOpen', () => {
      useNotificationStore.getState().setIsDeleteDialogOpen(true);
      expect(useNotificationStore.getState().isDeleteDialogOpen).toBe(true);

      useNotificationStore.getState().setIsDeleteDialogOpen(false);
      expect(useNotificationStore.getState().isDeleteDialogOpen).toBe(false);
    });
  });

  describe('setIsSheetOpen', () => {
    it('updates isSheetOpen', () => {
      useNotificationStore.getState().setIsSheetOpen(true);
      expect(useNotificationStore.getState().isSheetOpen).toBe(true);

      useNotificationStore.getState().setIsSheetOpen(false);
      expect(useNotificationStore.getState().isSheetOpen).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets state to initial values', () => {
      useNotificationStore.setState({
        notifications: mockNotifications as never,
        total: 3,
        unreadCount: 2,
        isSheetOpen: true,
        isDeleteDialogOpen: true,
      });

      useNotificationStore.getState().reset();

      const state = useNotificationStore.getState();
      expect(state.notifications).toEqual([]);
      expect(state.total).toBe(0);
      expect(state.unreadCount).toBe(0);
      expect(state.isSheetOpen).toBe(false);
      expect(state.isDeleteDialogOpen).toBe(false);
    });
  });
});
