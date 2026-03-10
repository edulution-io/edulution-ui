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

import { Test, TestingModule } from '@nestjs/testing';
import NotificationsController from './notifications.controller';
import NotificationsService from './notifications.service';

describe(NotificationsController.name, () => {
  let controller: NotificationsController;
  let notificationsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    notificationsService = {
      getInboxNotifications: jest.fn().mockResolvedValue({ notifications: [], total: 0 }),
      getUnreadCount: jest.fn().mockResolvedValue(5),
      getSentNotifications: jest.fn().mockResolvedValue({ notifications: [], total: 0 }),
      getSentNotificationRecipients: jest.fn().mockResolvedValue([]),
      markAsRead: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      markAllAsRead: jest.fn().mockResolvedValue({ modifiedCount: 3 }),
      deleteUserNotification: jest.fn().mockResolvedValue(undefined),
      deleteSentNotification: jest.fn().mockResolvedValue(undefined),
      deleteAllUserNotifications: jest.fn().mockResolvedValue(5),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: notificationsService }],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getInbox', () => {
    it('should delegate to service with sanitized limit and offset', async () => {
      await controller.getInbox('user1', 20, 0);

      expect(notificationsService.getInboxNotifications).toHaveBeenCalledWith('user1', 20, 0);
    });

    it('should cap limit at 50', async () => {
      await controller.getInbox('user1', 100, 0);

      expect(notificationsService.getInboxNotifications).toHaveBeenCalledWith('user1', 50, 0);
    });

    it('should set minimum limit to 1', async () => {
      await controller.getInbox('user1', -5, 0);

      expect(notificationsService.getInboxNotifications).toHaveBeenCalledWith('user1', 1, 0);
    });
  });

  describe('getUnreadCount', () => {
    it('should return count wrapped in object', async () => {
      const result = await controller.getUnreadCount('user1');

      expect(notificationsService.getUnreadCount).toHaveBeenCalledWith('user1');
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('getSent', () => {
    it('should delegate to service with sanitized params', async () => {
      await controller.getSent('user1', 10, 5);

      expect(notificationsService.getSentNotifications).toHaveBeenCalledWith('user1', 10, 5);
    });
  });

  describe('getSentNotificationRecipients', () => {
    it('should delegate to service with notification id and username', async () => {
      await controller.getSentNotificationRecipients('notification-id', 'user1');

      expect(notificationsService.getSentNotificationRecipients).toHaveBeenCalledWith('notification-id', 'user1');
    });
  });

  describe('markAsRead', () => {
    it('should delegate to service with id and username', async () => {
      await controller.markAsRead('un-id', 'user1');

      expect(notificationsService.markAsRead).toHaveBeenCalledWith('un-id', 'user1');
    });
  });

  describe('markAllAsRead', () => {
    it('should delegate to service with username', async () => {
      await controller.markAllAsRead('user1');

      expect(notificationsService.markAllAsRead).toHaveBeenCalledWith('user1');
    });
  });

  describe('deleteSentNotification', () => {
    it('should delegate to service with id and username', async () => {
      await controller.deleteSentNotification('sent-id', 'user1');

      expect(notificationsService.deleteSentNotification).toHaveBeenCalledWith('sent-id', 'user1');
    });
  });

  describe('deleteNotification', () => {
    it('should delegate to service with id and username', async () => {
      await controller.deleteNotification('un-id', 'user1');

      expect(notificationsService.deleteUserNotification).toHaveBeenCalledWith('un-id', 'user1');
    });
  });

  describe('deleteAllNotifications', () => {
    it('should delegate to service and return deletedCount', async () => {
      const result = await controller.deleteAllNotifications('user1', 'all');

      expect(notificationsService.deleteAllUserNotifications).toHaveBeenCalledWith('user1', 'all');
      expect(result).toEqual({ deletedCount: 5 });
    });
  });
});
