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
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SchedulerRegistry } from '@nestjs/schedule';
import USER_NOTIFICATION_STATUS from '@libs/notification/constants/userNotificationStatus';
import NotificationsService from './notifications.service';
import { Notification } from './notification.schema';
import { UserNotification } from './userNotification.schema';
import PushNotificationQueue from './queue/push-notification.queue';
import UsersService from '../users/users.service';
import SseService from '../sse/sse.service';
import FilesystemService from '../filesystem/filesystem.service';

describe(NotificationsService.name, () => {
  let service: NotificationsService;
  let notificationModel: Record<string, jest.Mock>;
  let userNotificationModel: Record<string, jest.Mock>;
  let pushQueue: Record<string, jest.Mock>;
  let usersService: Record<string, jest.Mock>;
  let sseService: Record<string, jest.Mock>;

  beforeEach(async () => {
    notificationModel = {
      create: jest.fn(),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      aggregate: jest.fn().mockResolvedValue([]),
      collection: { name: 'notifications' },
    };

    userNotificationModel = {
      insertMany: jest.fn().mockResolvedValue([]),
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      aggregate: jest.fn().mockResolvedValue([]),
      collection: { name: 'usernotifications' },
    };

    pushQueue = {
      enqueue: jest.fn().mockResolvedValue(undefined),
    };

    usersService = {
      getPushTokensByUsernames: jest.fn().mockResolvedValue(['ExponentPushToken[abc123]']),
    };

    sseService = {
      sendEventToUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        SseService,
        ConfigService,
        { provide: getModelToken(Notification.name), useValue: notificationModel },
        { provide: getModelToken(UserNotification.name), useValue: userNotificationModel },
        { provide: PushNotificationQueue, useValue: pushQueue },
        { provide: UsersService, useValue: usersService },
        { provide: SseService, useValue: sseService },
        { provide: FilesystemService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn() } },
        { provide: SchedulerRegistry, useValue: { addCronJob: jest.fn() } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPushNotification', () => {
    it('should enqueue push notification with token and data', async () => {
      await service.sendPushNotification({ to: ['token1'], title: 'Test', body: 'Body' });

      expect(pushQueue.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({ to: ['token1'], title: 'Test', body: 'Body' }),
      );
    });
  });

  describe('notifyUsernames', () => {
    it('should create notification and send push when createNotificationDto is provided', async () => {
      const mockNotification = { id: new Types.ObjectId().toString() };
      notificationModel.create.mockResolvedValue(mockNotification);
      userNotificationModel.insertMany.mockResolvedValue([{ username: 'user1' }]);

      await service.notifyUsernames(['user1'], { title: 'Hello', body: 'World' }, 'system', {
        type: 'system',
        title: 'Hello',
        pushNotification: 'World',
        createdBy: 'system',
      } as never);

      expect(notificationModel.create).toHaveBeenCalled();
      expect(userNotificationModel.insertMany).toHaveBeenCalled();
      expect(sseService.sendEventToUsers).toHaveBeenCalled();
      expect(pushQueue.enqueue).toHaveBeenCalled();
    });

    it('should skip push when skipPush is true', async () => {
      const mockNotification = { id: new Types.ObjectId().toString() };
      notificationModel.create.mockResolvedValue(mockNotification);
      userNotificationModel.insertMany.mockResolvedValue([]);

      await service.notifyUsernames(
        ['user1'],
        { title: 'Hello', body: 'World' },
        'system',
        { type: 'system', title: 'Hello', pushNotification: 'World', createdBy: 'system' } as never,
        true,
      );

      expect(pushQueue.enqueue).not.toHaveBeenCalled();
    });

    it('should rollback notification on error', async () => {
      const notificationId = new Types.ObjectId().toString();
      const mockNotification = { id: notificationId };
      notificationModel.create.mockResolvedValue(mockNotification);
      userNotificationModel.insertMany.mockResolvedValue([]);
      usersService.getPushTokensByUsernames.mockRejectedValue(new Error('Push token fetch failed'));

      await expect(
        service.notifyUsernames(['user1'], { title: 'Hello', body: 'World' }, 'system', {
          type: 'system',
          title: 'Hello',
          pushNotification: 'World',
          createdBy: 'system',
        } as never),
      ).rejects.toThrow('Push token fetch failed');

      expect(notificationModel.deleteOne).toHaveBeenCalled();
      expect(userNotificationModel.deleteMany).toHaveBeenCalled();
    });

    it('should send push without creating notification when no dto provided', async () => {
      await service.notifyUsernames(['user1'], { title: 'Quick', body: 'Msg' });

      expect(notificationModel.create).not.toHaveBeenCalled();
      expect(pushQueue.enqueue).toHaveBeenCalled();
    });
  });

  describe('createUserNotifications', () => {
    it('should insert user notifications in batches', async () => {
      userNotificationModel.insertMany.mockResolvedValue([{ username: 'user1' }, { username: 'user2' }]);

      const result = await service.createUserNotifications(new Types.ObjectId().toString(), ['user1', 'user2']);

      expect(result.inserted).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should handle partial failures in batches', async () => {
      const bulkError = new Error('Bulk write error');
      Object.defineProperty(bulkError, 'insertedCount', { value: 1 });
      Object.setPrototypeOf(bulkError, Error.prototype);
      userNotificationModel.insertMany.mockRejectedValue(bulkError);

      const result = await service.createUserNotifications(new Types.ObjectId().toString(), ['user1', 'user2']);

      expect(result.failed).toBeGreaterThan(0);
    });
  });

  describe('cascadeDeleteBySourceId', () => {
    it('should delete notification and user notifications when source exists', async () => {
      const notificationId = new Types.ObjectId();
      notificationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ id: notificationId.toString() }),
      });

      await service.cascadeDeleteBySourceId('source-123');

      expect(userNotificationModel.deleteMany).toHaveBeenCalled();
      expect(notificationModel.deleteOne).toHaveBeenCalled();
    });

    it('should do nothing when source does not exist', async () => {
      notificationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.cascadeDeleteBySourceId('nonexistent');

      expect(userNotificationModel.deleteMany).not.toHaveBeenCalled();
      expect(notificationModel.deleteOne).not.toHaveBeenCalled();
    });
  });

  describe('upsertNotificationForSource', () => {
    it('should create new notification when no existing source found', async () => {
      notificationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      const mockNotification = { id: new Types.ObjectId().toString() };
      notificationModel.create.mockResolvedValue(mockNotification);
      userNotificationModel.insertMany.mockResolvedValue([]);

      await service.upsertNotificationForSource(
        ['user1'],
        { title: 'New', body: 'Notification' },
        'system',
        {
          type: 'system',
          sourceType: 'survey',
          sourceId: 'survey-1',
          title: 'New',
          pushNotification: 'Notification',
          createdBy: 'system',
        } as never,
        true,
      );

      expect(notificationModel.create).toHaveBeenCalled();
    });

    it('should delegate to notifyUsernames when sourceType or sourceId is missing', async () => {
      const mockNotification = { id: new Types.ObjectId().toString() };
      notificationModel.create.mockResolvedValue(mockNotification);
      userNotificationModel.insertMany.mockResolvedValue([]);

      await service.upsertNotificationForSource(
        ['user1'],
        { title: 'No Source', body: 'Body' },
        'system',
        { type: 'system', title: 'No Source', pushNotification: 'Body', createdBy: 'system' } as never,
        true,
      );

      expect(notificationModel.create).toHaveBeenCalled();
    });
  });

  describe('findNotificationBySource', () => {
    it('should query by sourceType and sourceId', async () => {
      notificationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ sourceType: 'survey', sourceId: 'abc' }),
      });

      const result = await service.findNotificationBySource('survey' as never, 'abc');

      expect(result).toEqual(expect.objectContaining({ sourceType: 'survey', sourceId: 'abc' }));
    });
  });

  describe('markAsRead', () => {
    it('should update a single user notification to read', async () => {
      const id = new Types.ObjectId().toString();

      const result = await service.markAsRead(id, 'user1');

      expect(userNotificationModel.updateOne).toHaveBeenCalled();
      const updateArgs = userNotificationModel.updateOne.mock.calls[0] as unknown[];
      expect(updateArgs[0]).toEqual(expect.objectContaining({ username: 'user1', readAt: null }));
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('markAllAsRead', () => {
    it('should update all user notifications for username to read', async () => {
      const result = await service.markAllAsRead('user1');

      expect(userNotificationModel.updateMany).toHaveBeenCalledWith(
        { username: 'user1', readAt: null },
        expect.anything(),
        { timestamps: false },
      );
      expect(result).toEqual({ modifiedCount: 0 });
    });
  });

  describe('deleteUserNotification', () => {
    it('should delete user notification and clean up orphans', async () => {
      const id = new Types.ObjectId();
      const notificationId = new Types.ObjectId();
      userNotificationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: id, notificationId, username: 'user1' }),
      });
      notificationModel.aggregate.mockResolvedValue([]);

      await service.deleteUserNotification(id.toString(), 'user1');

      expect(userNotificationModel.deleteOne).toHaveBeenCalledWith(expect.objectContaining({ username: 'user1' }));
    });

    it('should do nothing when user notification not found', async () => {
      userNotificationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.deleteUserNotification(new Types.ObjectId().toString(), 'user1');

      expect(userNotificationModel.deleteOne).not.toHaveBeenCalled();
    });
  });

  describe('deleteSentNotification', () => {
    it('should delete sent notification and associated user notifications', async () => {
      const id = new Types.ObjectId();
      notificationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ id: id.toString() }),
      });

      await service.deleteSentNotification(id.toString(), 'creator');

      expect(userNotificationModel.deleteMany).toHaveBeenCalled();
      expect(notificationModel.deleteOne).toHaveBeenCalled();
    });

    it('should do nothing with invalid ObjectId', async () => {
      await service.deleteSentNotification('invalid', 'creator');

      expect(notificationModel.findOne).not.toHaveBeenCalled();
    });

    it('should do nothing when notification not found', async () => {
      const id = new Types.ObjectId();
      notificationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.deleteSentNotification(id.toString(), 'creator');

      expect(userNotificationModel.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('getSentNotificationRecipients', () => {
    it('should return empty array for invalid ObjectId', async () => {
      const result = await service.getSentNotificationRecipients('invalid', 'creator');
      expect(result).toEqual([]);
    });

    it('should return empty array when notification not found', async () => {
      notificationModel.findOne.mockResolvedValue(null);

      const result = await service.getSentNotificationRecipients(new Types.ObjectId().toString(), 'creator');
      expect(result).toEqual([]);
    });
  });

  describe('getUnreadCount', () => {
    it('should return 0 when no unread notifications', async () => {
      userNotificationModel.aggregate.mockResolvedValue([]);

      const result = await service.getUnreadCount('user1');
      expect(result).toBe(0);
    });

    it('should return count from aggregate result', async () => {
      userNotificationModel.aggregate.mockResolvedValue([{ total: 5 }]);

      const result = await service.getUnreadCount('user1');
      expect(result).toBe(5);
    });
  });

  describe('updateUserNotificationStatus', () => {
    it('should update status for matching user notifications', async () => {
      const notificationId = new Types.ObjectId().toString();

      await service.updateUserNotificationStatus(notificationId, ['user1'], USER_NOTIFICATION_STATUS.SENT);

      expect(userNotificationModel.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ username: { $in: ['user1'] } }),
        { $set: { status: USER_NOTIFICATION_STATUS.SENT } },
        { timestamps: false },
      );
    });
  });

  describe('deleteAllUserNotifications', () => {
    it('should delete all user notifications for ALL type', async () => {
      userNotificationModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      userNotificationModel.deleteMany.mockResolvedValue({ deletedCount: 3 });

      const result = await service.deleteAllUserNotifications('user1', 'all');
      expect(result).toBe(3);
    });
  });
});
