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

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo, Types } from 'mongoose';
import SendPushNotificationDto from '@libs/notification/types/send-pushNotification.dto';
import CreateNotificationDto from '@libs/notification/types/createNotification.dto';
import InboxNotificationDto from '@libs/notification/types/inboxNotification.dto';
import NotificationRecipientDto from '@libs/notification/types/notificationRecipient.dto';
import USER_NOTIFICATION_STATUS from '@libs/notification/constants/userNotificationStatus';
import NOTIFICATION_TYPE from '@libs/notification/constants/notificationType';
import { NOTIFICATION_FILTER_TYPE, NotificationFilterType } from '@libs/notification/types/notificationFilterType';
import BULK_INSERT_BATCH_SIZE from '@libs/common/constants/bulkInsertBatchSize';
import BulkInsertResult from '@libs/common/types/bulkInsertResult';
import UsersService from '../users/users.service';
import PushNotificationQueue from './queue/push-notification.queue';
import { Notification, NotificationDocument } from './notification.schema';
import { UserNotification, UserNotificationDocument } from './userNotification.schema';

@Injectable()
class NotificationsService {
  constructor(
    private userService: UsersService,
    private pushNotificationQueue: PushNotificationQueue,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(UserNotification.name) private userNotificationModel: Model<UserNotificationDocument>,
  ) {}

  async sendPushNotification(
    sendPushNotificationDto: SendPushNotificationDto,
    triggeredBy: string = NOTIFICATION_TYPE.USER,
  ): Promise<void> {
    await this.pushNotificationQueue.enqueue({
      username: triggeredBy,
      ...sendPushNotificationDto,
    });
  }

  async notifyUsernames(
    usernames: string[],
    partialNotification: Omit<SendPushNotificationDto, 'to'>,
    triggeredBy: string = NOTIFICATION_TYPE.USER,
    createNotificationDto?: CreateNotificationDto,
  ): Promise<void> {
    let notification: NotificationDocument | null = null;

    try {
      if (createNotificationDto) {
        notification = await this.notificationModel.create(createNotificationDto);
        const notificationId = String(notification.id);
        const result = await this.createUserNotifications(notificationId, usernames);

        if (result.failed > 0) {
          Logger.error(
            `Failed to create ${result.failed}/${usernames.length} user notifications for notification ${notificationId}`,
            NotificationsService.name,
          );
        }
      }

      const uniqueTokens = await this.userService.getPushTokensByUsernames(usernames);
      await this.sendPushNotification({ to: uniqueTokens, ...partialNotification }, triggeredBy);

      if (notification) {
        await this.updateUserNotificationStatus(String(notification.id), usernames, USER_NOTIFICATION_STATUS.SENT);
      }
    } catch (error) {
      if (notification) {
        const notificationObjectId = new Types.ObjectId(String(notification.id));
        await this.notificationModel.deleteOne({ _id: notificationObjectId });
        await this.userNotificationModel.deleteMany({ notificationId: notificationObjectId });
        Logger.warn(`Rolled back notification ${notification.id} due to error`, NotificationsService.name);
      }
      throw error;
    }
  }

  async createUserNotifications(notificationId: string, usernames: string[]): Promise<BulkInsertResult> {
    const objectId = new Types.ObjectId(notificationId);

    const batchCount = Math.ceil(usernames.length / BULK_INSERT_BATCH_SIZE);
    const batches = Array.from({ length: batchCount }, (_, i) =>
      usernames.slice(i * BULK_INSERT_BATCH_SIZE, (i + 1) * BULK_INSERT_BATCH_SIZE),
    );

    const result = await batches.reduce(
      async (accPromise, batch, index) => {
        const acc = await accPromise;
        const documents = batch.map((username) => ({
          notificationId: objectId,
          username,
          readAt: null,
          status: USER_NOTIFICATION_STATUS.PENDING,
        }));

        try {
          const insertResult = await this.userNotificationModel.insertMany(documents, { ordered: false });
          acc.inserted += insertResult.length;
        } catch (error) {
          const batchNumber = index + 1;
          if (error instanceof mongo.MongoBulkWriteError) {
            const insertedCount = error.insertedCount ?? 0;
            acc.inserted += insertedCount;
            acc.failed += batch.length - insertedCount;
            acc.errors.push(`Batch ${batchNumber}: ${error.message}`);
          } else {
            acc.failed += batch.length;
            acc.errors.push(`Batch ${batchNumber}: ${(error as Error).message}`);
          }
        }

        return acc;
      },
      Promise.resolve({ inserted: 0, failed: 0, errors: [] as string[] }),
    );

    if (result.errors.length > 0) {
      Logger.warn(
        `createUserNotifications partial failure: ${result.inserted}/${usernames.length} inserted`,
        NotificationsService.name,
      );
    }

    return result;
  }

  async updateUserNotificationStatus(
    notificationId: string,
    usernames: string[],
    status: (typeof USER_NOTIFICATION_STATUS)[keyof typeof USER_NOTIFICATION_STATUS],
  ): Promise<void> {
    const objectId = new Types.ObjectId(notificationId);
    await this.userNotificationModel.updateMany(
      { notificationId: objectId, username: { $in: usernames } },
      { $set: { status } },
    );
  }

  async getInboxNotifications(
    username: string,
    limit = 20,
    offset = 0,
  ): Promise<{ notifications: InboxNotificationDto[]; total: number }> {
    const result = await this.userNotificationModel.aggregate<{
      data: Array<{
        id: string;
        notificationId: Types.ObjectId;
        readAt: Date | null;
        notification: Notification & { id: string };
      }>;
      total: Array<{ count: number }>;
    }>([
      { $match: { username } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: this.notificationModel.collection.name,
          localField: 'notificationId',
          foreignField: '_id',
          as: 'notification',
        },
      },
      { $unwind: '$notification' },
      { $match: { 'notification.createdBy': { $ne: username } } },
      {
        $addFields: {
          id: { $toString: '$_id' },
          'notification.id': { $toString: '$notification._id' },
        },
      },
      {
        $facet: {
          data: [{ $skip: offset }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    const data = result[0]?.data ?? [];
    const total = result[0]?.total[0]?.count ?? 0;

    const notifications: InboxNotificationDto[] = data.map((item) => ({
      id: item.id,
      notificationId: item.notification.id,
      type: item.notification.type,
      sourceType: item.notification.sourceType,
      sourceId: item.notification.sourceId,
      title: item.notification.title,
      pushNotification: item.notification.pushNotification,
      content: item.notification.content,
      data: item.notification.data,
      createdAt: item.notification.createdAt,
      createdBy: item.notification.createdBy,
      readAt: item.readAt,
    }));

    return { notifications, total };
  }

  async getSentNotifications(
    username: string,
    limit = 20,
    offset = 0,
  ): Promise<{ notifications: InboxNotificationDto[]; total: number }> {
    const result = await this.notificationModel.aggregate<{
      data: Array<{
        id: string;
        type: string;
        sourceType?: string;
        sourceId?: string;
        title: string;
        pushNotification: string;
        content?: string;
        data?: Record<string, unknown>;
        createdAt: Date;
        createdBy: string;
        sentStats: { recipientCount: number; readCount: number };
      }>;
      total: Array<{ count: number }>;
    }>([
      { $match: { createdBy: username } },
      { $sort: { createdAt: -1 } },
      { $addFields: { id: { $toString: '$_id' } } },
      {
        $lookup: {
          from: this.userNotificationModel.collection.name,
          localField: '_id',
          foreignField: 'notificationId',
          as: 'recipients',
        },
      },
      {
        $addFields: {
          sentStats: {
            recipientCount: { $size: '$recipients' },
            readCount: {
              $size: {
                $filter: {
                  input: '$recipients',
                  as: 'recipient',
                  cond: { $ne: ['$$recipient.readAt', null] },
                },
              },
            },
          },
        },
      },
      { $project: { recipients: 0 } },
      {
        $facet: {
          data: [{ $skip: offset }, { $limit: limit }],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    const data = result[0]?.data ?? [];
    const total = result[0]?.total[0]?.count ?? 0;

    const notifications: InboxNotificationDto[] = data.map((item) => ({
      id: item.id,
      notificationId: item.id,
      type: item.type as InboxNotificationDto['type'],
      sourceType: item.sourceType as InboxNotificationDto['sourceType'],
      sourceId: item.sourceId,
      title: item.title,
      pushNotification: item.pushNotification,
      content: item.content,
      data: item.data,
      createdAt: item.createdAt,
      createdBy: item.createdBy,
      readAt: null,
      sentStats: item.sentStats,
    }));

    return { notifications, total };
  }

  async getSentNotificationRecipients(notificationId: string, username: string): Promise<NotificationRecipientDto[]> {
    const objectId = new Types.ObjectId(notificationId);

    const notification = await this.notificationModel.findOne({
      _id: objectId,
      createdBy: username,
    });

    if (!notification) {
      return [];
    }

    const recipients = await this.userNotificationModel
      .find({ notificationId: objectId }, { username: 1, readAt: 1 })
      .sort({ username: 1 })
      .exec();

    return recipients.map((r) => ({
      username: r.username,
      readAt: r.readAt,
    }));
  }

  async getUnreadCount(username: string): Promise<number> {
    const result = await this.userNotificationModel.aggregate<{ total: number }>([
      { $match: { username, readAt: null } },
      {
        $lookup: {
          from: this.notificationModel.collection.name,
          localField: 'notificationId',
          foreignField: '_id',
          as: 'notification',
        },
      },
      { $unwind: '$notification' },
      {
        $match: {
          'notification.type': NOTIFICATION_TYPE.USER,
          'notification.createdBy': { $ne: username },
        },
      },
      { $count: 'total' },
    ]);

    return result[0]?.total ?? 0;
  }

  async markAsRead(username: string, notificationIds?: string[]): Promise<{ modifiedCount: number }> {
    if (notificationIds?.length) {
      const objectIds = notificationIds.map((id) => new Types.ObjectId(id));

      const validNotifications = await this.notificationModel
        .find({
          _id: { $in: objectIds },
          type: NOTIFICATION_TYPE.USER,
        })
        .exec();

      if (validNotifications.length === 0) {
        return { modifiedCount: 0 };
      }

      const validObjectIds = validNotifications.map((notification) => new Types.ObjectId(String(notification.id)));
      const result = await this.userNotificationModel.updateMany(
        { notificationId: { $in: validObjectIds }, username, readAt: null },
        { $set: { readAt: new Date() } },
      );

      return { modifiedCount: result.modifiedCount };
    }

    const userNotificationIds = await this.userNotificationModel.aggregate<{ id: Types.ObjectId }>([
      { $match: { username, readAt: null } },
      {
        $lookup: {
          from: this.notificationModel.collection.name,
          localField: 'notificationId',
          foreignField: '_id',
          as: 'notification',
        },
      },
      { $unwind: '$notification' },
      { $match: { 'notification.type': NOTIFICATION_TYPE.USER } },
      { $project: { _id: 1 } },
    ]);

    const ids = userNotificationIds.map((doc) => doc.id);
    if (ids.length === 0) {
      return { modifiedCount: 0 };
    }

    const result = await this.userNotificationModel.updateMany({ _id: { $in: ids } }, { $set: { readAt: new Date() } });

    return { modifiedCount: result.modifiedCount };
  }

  async deleteUserNotification(userNotificationId: string, username: string): Promise<void> {
    const objectId = new Types.ObjectId(userNotificationId);

    const userNotification = await this.userNotificationModel.findOne({ _id: objectId, username }).exec();
    if (!userNotification) {
      return;
    }

    await this.userNotificationModel.deleteOne({ _id: objectId, username });
    await this.cleanupOrphanedNotifications([userNotification.notificationId]);
  }

  async deleteSentNotification(notificationId: string, username: string): Promise<void> {
    const objectId = new Types.ObjectId(notificationId);

    const notification = await this.notificationModel.findOne({ _id: objectId, createdBy: username }).exec();
    if (!notification) {
      return;
    }

    await this.userNotificationModel.deleteMany({ notificationId: objectId });
    await this.notificationModel.deleteOne({ _id: objectId });

    Logger.log(
      `Deleted sent notification ${notificationId} and all associated user notifications`,
      NotificationsService.name,
    );
  }

  private async cleanupOrphanedNotifications(notificationIds: Types.ObjectId[]): Promise<number> {
    if (notificationIds.length === 0) {
      return 0;
    }

    const uniqueIds = [...new Set(notificationIds.map((id) => id.toString()))].map((id) => new Types.ObjectId(id));

    const orphanedIds = await this.notificationModel.aggregate<{ id: string }>([
      { $match: { _id: { $in: uniqueIds } } },
      {
        $lookup: {
          from: this.userNotificationModel.collection.name,
          localField: '_id',
          foreignField: 'notificationId',
          as: 'userNotifications',
        },
      },
      { $match: { userNotifications: { $size: 0 } } },
      { $addFields: { id: { $toString: '$_id' } } },
      { $project: { id: 1 } },
    ]);

    if (orphanedIds.length === 0) {
      return 0;
    }

    const idsToDelete = orphanedIds.map((doc) => new Types.ObjectId(doc.id));
    const result = await this.notificationModel.deleteMany({ _id: { $in: idsToDelete } });

    if (result.deletedCount > 0) {
      Logger.log(`Cleaned up ${result.deletedCount} orphaned notifications`, NotificationsService.name);
    }

    return result.deletedCount;
  }

  async deleteAllUserNotifications(username: string, type: NotificationFilterType): Promise<number> {
    if (type === NOTIFICATION_FILTER_TYPE.ALL) {
      const userNotifications = await this.userNotificationModel.find({ username }, { notificationId: 1 }).exec();
      const notificationIdsToCheck = userNotifications.map((un) => un.notificationId);

      const result = await this.userNotificationModel.deleteMany({ username });

      if (notificationIdsToCheck.length > 0) {
        await this.cleanupOrphanedNotifications(notificationIdsToCheck);
      }

      return result.deletedCount;
    }

    if (type === NOTIFICATION_FILTER_TYPE.SENT) {
      return this.deleteAllSentNotifications(username);
    }

    const userNotificationsData = await this.userNotificationModel.aggregate<{ notificationId: Types.ObjectId }>([
      { $match: { username } },
      {
        $lookup: {
          from: this.notificationModel.collection.name,
          localField: 'notificationId',
          foreignField: '_id',
          as: 'notification',
        },
      },
      { $unwind: '$notification' },
      { $match: { 'notification.type': type } },
      { $project: { notificationId: 1 } },
    ]);

    const notificationIds = userNotificationsData.map((doc) => doc.notificationId);
    if (notificationIds.length === 0) {
      return 0;
    }

    const result = await this.userNotificationModel.deleteMany({
      username,
      notificationId: { $in: notificationIds },
    });

    await this.cleanupOrphanedNotifications(notificationIds);

    return result.deletedCount;
  }

  async deleteAllSentNotifications(username: string): Promise<number> {
    const sentNotifications = await this.notificationModel.find({ createdBy: username }, { _id: 1 }).exec();

    if (sentNotifications.length === 0) {
      return 0;
    }

    const notificationIds = sentNotifications.map((n) => new Types.ObjectId(String(n.id)));

    await this.userNotificationModel.deleteMany({ notificationId: { $in: notificationIds } });
    const result = await this.notificationModel.deleteMany({ _id: { $in: notificationIds } });

    return result.deletedCount;
  }

  @Cron('0 0 4 * * *', {
    name: 'ClearTempFiles',
    timeZone: 'UTC',
  })
  async cleanupOrphanedUserNotifications(): Promise<void> {
    Logger.log('Starting scheduled cleanup of orphaned UserNotifications', NotificationsService.name);

    try {
      const orphanedUserNotifications = await this.userNotificationModel.aggregate<{ id: string }>([
        {
          $lookup: {
            from: this.notificationModel.collection.name,
            localField: 'notificationId',
            foreignField: '_id',
            as: 'notification',
          },
        },
        { $match: { notification: { $size: 0 } } },
        { $addFields: { id: { $toString: '$_id' } } },
        { $project: { id: 1 } },
      ]);

      if (orphanedUserNotifications.length === 0) {
        Logger.log('No orphaned UserNotifications found', NotificationsService.name);
        return;
      }

      const idsToDelete = orphanedUserNotifications.map((doc) => new Types.ObjectId(doc.id));
      const result = await this.userNotificationModel.deleteMany({ _id: { $in: idsToDelete } });

      Logger.log(
        `Cleanup completed: ${result.deletedCount} orphaned UserNotifications deleted`,
        NotificationsService.name,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to cleanup orphaned UserNotifications: ${errorMessage}`, NotificationsService.name);
    }
  }
}

export default NotificationsService;
