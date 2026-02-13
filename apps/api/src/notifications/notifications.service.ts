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
import { Model, mongo, PipelineStage, Types } from 'mongoose';
import SendPushNotificationDto from '@libs/notification/types/send-pushNotification.dto';
import CreateNotificationDto from '@libs/notification/types/createNotification.dto';
import NotificationSourceType from '@libs/notification/types/notificationSourceType';
import InboxNotificationDto from '@libs/notification/types/inboxNotification.dto';
import NotificationRecipientDto from '@libs/notification/types/notificationRecipient.dto';
import USER_NOTIFICATION_STATUS from '@libs/notification/constants/userNotificationStatus';
import NOTIFICATION_TYPE from '@libs/notification/constants/notificationType';
import { NOTIFICATION_FILTER_TYPE, NotificationFilterType } from '@libs/notification/types/notificationFilterType';
import BULK_INSERT_BATCH_SIZE from '@libs/common/constants/bulkInsertBatchSize';
import BulkInsertResult from '@libs/common/types/bulkInsertResult';
import SAME_SOURCE_PUSH_DEBOUNCE_MINUTES from '@libs/notification/constants/sameSourcePushDebounceMinutes';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import UsersService from '../users/users.service';
import SseService from '../sse/sse.service';
import PushNotificationQueue from './queue/push-notification.queue';
import { Notification, NotificationDocument } from './notification.schema';
import { UserNotification, UserNotificationDocument } from './userNotification.schema';

@Injectable()
class NotificationsService {
  constructor(
    private userService: UsersService,
    private sseService: SseService,
    private pushNotificationQueue: PushNotificationQueue,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(UserNotification.name) private userNotificationModel: Model<UserNotificationDocument>,
  ) {}

  private static shouldSendPush(notification: NotificationDocument): boolean {
    if (!notification.lastPushSentAt) {
      return true;
    }

    const debounceMs = SAME_SOURCE_PUSH_DEBOUNCE_MINUTES * 60 * 1000;
    const timeSinceLastPush = Date.now() - notification.lastPushSentAt.getTime();

    return timeSinceLastPush >= debounceMs;
  }

  private async updateLastPushSentAt(notificationId: string): Promise<void> {
    const objectId = new Types.ObjectId(notificationId);
    await this.notificationModel.updateOne({ _id: objectId }, { $set: { lastPushSentAt: new Date() } });
  }

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

        this.sseService.sendEventToUsers(usernames, 'updated', SSE_MESSAGE_TYPE.NOTIFICATION_INBOX_UPDATED);
      }

      const uniqueTokens = await this.userService.getPushTokensByUsernames(usernames);
      await this.sendPushNotification({ to: uniqueTokens, ...partialNotification }, triggeredBy);

      if (notification) {
        await this.updateLastPushSentAt(String(notification.id));
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
    const batches = Array.from({ length: batchCount }, (_, batchIndex) =>
      usernames.slice(batchIndex * BULK_INSERT_BATCH_SIZE, (batchIndex + 1) * BULK_INSERT_BATCH_SIZE),
    );

    const batchResults = await Promise.all(
      batches.map(async (batch, index) => {
        const documents = batch.map((username) => ({
          notificationId: objectId,
          username,
          readAt: null,
          status: USER_NOTIFICATION_STATUS.PENDING,
        }));

        try {
          const insertResult = await this.userNotificationModel.insertMany(documents, { ordered: false });
          return { inserted: insertResult.length, failed: 0, error: null };
        } catch (error) {
          const batchNumber = index + 1;
          if (error instanceof mongo.MongoBulkWriteError) {
            const insertedCount = error.insertedCount ?? 0;
            return {
              inserted: insertedCount,
              failed: batch.length - insertedCount,
              error: `Batch ${batchNumber}: ${error.message}`,
            };
          }
          return {
            inserted: 0,
            failed: batch.length,
            error: `Batch ${batchNumber}: ${(error as Error).message}`,
          };
        }
      }),
    );

    const result = batchResults.reduce(
      (acc, batchResult) => ({
        inserted: acc.inserted + batchResult.inserted,
        failed: acc.failed + batchResult.failed,
        errors: batchResult.error ? [...acc.errors, batchResult.error] : acc.errors,
      }),
      { inserted: 0, failed: 0, errors: [] as string[] },
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
      { timestamps: false },
    );
  }

  async findNotificationBySource(
    sourceType: NotificationSourceType,
    sourceId: string,
  ): Promise<NotificationDocument | null> {
    return this.notificationModel.findOne({ sourceType, sourceId }).exec();
  }

  async cascadeDeleteBySourceId(sourceId: string): Promise<void> {
    const notification = await this.notificationModel.findOne({ sourceId }).exec();
    if (!notification) {
      return;
    }

    const notificationObjectId = new Types.ObjectId(String(notification.id));
    await this.userNotificationModel.deleteMany({ notificationId: notificationObjectId });
    await this.notificationModel.deleteOne({ _id: notificationObjectId });

    Logger.log(`Cascade deleted notification ${notification.id} for sourceId ${sourceId}`, NotificationsService.name);
  }

  async upsertNotificationForSource(
    usernames: string[],
    partialNotification: Omit<SendPushNotificationDto, 'to'>,
    triggeredBy: string | undefined,
    createNotificationDto: CreateNotificationDto,
  ): Promise<void> {
    const effectiveTriggeredBy = triggeredBy ?? NOTIFICATION_TYPE.USER;
    const { sourceType, sourceId } = createNotificationDto;

    if (!sourceType || !sourceId) {
      await this.notifyUsernames(usernames, partialNotification, effectiveTriggeredBy, createNotificationDto);
      return;
    }

    const existingNotification = await this.findNotificationBySource(sourceType, sourceId);

    if (existingNotification) {
      await this.updateExistingNotification(
        existingNotification,
        usernames,
        partialNotification,
        effectiveTriggeredBy,
        createNotificationDto,
      );
    } else {
      await this.notifyUsernames(usernames, partialNotification, effectiveTriggeredBy, createNotificationDto);
    }
  }

  private async updateExistingNotification(
    existingNotification: NotificationDocument,
    usernames: string[],
    partialNotification: Omit<SendPushNotificationDto, 'to'>,
    triggeredBy: string,
    updateData: CreateNotificationDto,
  ): Promise<void> {
    const notificationId = String(existingNotification.id);
    const objectId = new Types.ObjectId(notificationId);

    await this.notificationModel.updateOne(
      { _id: objectId },
      {
        $set: {
          title: updateData.title,
          pushNotification: updateData.pushNotification,
          content: updateData.content,
          data: updateData.data,
        },
      },
    );

    await this.syncUserNotifications(notificationId, usernames);

    this.sseService.sendEventToUsers(usernames, 'updated', SSE_MESSAGE_TYPE.NOTIFICATION_INBOX_UPDATED);

    if (NotificationsService.shouldSendPush(existingNotification)) {
      const uniqueTokens = await this.userService.getPushTokensByUsernames(usernames);
      await this.sendPushNotification({ to: uniqueTokens, ...partialNotification }, triggeredBy);
      await this.updateLastPushSentAt(notificationId);
      await this.updateUserNotificationStatus(notificationId, usernames, USER_NOTIFICATION_STATUS.SENT);
    } else {
      Logger.log(
        `Push debounced for notification ${notificationId} (last sent: ${existingNotification.lastPushSentAt?.toISOString()})`,
        NotificationsService.name,
      );
    }
  }

  private async syncUserNotifications(notificationId: string, usernames: string[]): Promise<void> {
    const objectId = new Types.ObjectId(notificationId);

    const existingUserNotifications = await this.userNotificationModel.find({ notificationId: objectId }).exec();
    const existingUsernames = new Set(existingUserNotifications.map((userNotification) => userNotification.username));
    const targetUsernames = new Set(usernames);

    const usernamesToAdd = usernames.filter((username) => !existingUsernames.has(username));
    const usernamesToRemove = [...existingUsernames].filter((username) => !targetUsernames.has(username));
    const usernamesToResetRead = usernames.filter((username) => existingUsernames.has(username));

    if (usernamesToRemove.length > 0) {
      await this.userNotificationModel.deleteMany({
        notificationId: objectId,
        username: { $in: usernamesToRemove },
      });
    }

    if (usernamesToAdd.length > 0) {
      const documents = usernamesToAdd.map((username) => ({
        notificationId: objectId,
        username,
        readAt: null,
        status: USER_NOTIFICATION_STATUS.PENDING,
      }));

      try {
        await this.userNotificationModel.insertMany(documents, { ordered: false });
      } catch (error) {
        if (error instanceof mongo.MongoBulkWriteError) {
          Logger.warn(
            `Some user notifications already existed during sync: ${error.insertedCount}/${documents.length}`,
            NotificationsService.name,
          );
        } else {
          throw error;
        }
      }
    }

    if (usernamesToResetRead.length > 0) {
      await this.userNotificationModel.updateMany(
        { notificationId: objectId, username: { $in: usernamesToResetRead } },
        { $set: { readAt: null, status: USER_NOTIFICATION_STATUS.PENDING } },
      );
    }

    Logger.log(
      `Synced UserNotifications for ${notificationId}: +${usernamesToAdd.length}, -${usernamesToRemove.length}, reset=${usernamesToResetRead.length}`,
      NotificationsService.name,
    );
  }

  private buildUserNotificationPipeline(
    username: string,
    additionalUserNotificationMatch: object = {},
    additionalNotificationMatch: object = {},
  ): PipelineStage[] {
    return [
      { $match: { username, ...additionalUserNotificationMatch } },
      { $sort: { updatedAt: -1 as const } },
      {
        $lookup: {
          from: this.notificationModel.collection.name,
          localField: 'notificationId',
          foreignField: '_id',
          as: 'notification',
        },
      },
      { $unwind: '$notification' },
      { $match: { 'notification.createdBy': { $ne: username }, ...additionalNotificationMatch } },
    ];
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
      ...this.buildUserNotificationPipeline(username),
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

    const notifications: InboxNotificationDto[] = data.map((userNotificationData) => ({
      id: userNotificationData.id,
      notificationId: userNotificationData.notification.id,
      type: userNotificationData.notification.type,
      sourceType: userNotificationData.notification.sourceType,
      sourceId: userNotificationData.notification.sourceId,
      title: userNotificationData.notification.title,
      pushNotification: userNotificationData.notification.pushNotification,
      content: userNotificationData.notification.content,
      data: userNotificationData.notification.data,
      createdAt: userNotificationData.notification.createdAt,
      updatedAt: userNotificationData.notification.updatedAt,
      createdBy: userNotificationData.notification.createdBy,
      readAt: userNotificationData.readAt,
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
      ...this.buildUserNotificationPipeline(username, { readAt: null }),
      { $count: 'total' },
    ]);

    return result[0]?.total ?? 0;
  }

  async markAsRead(userNotificationId: string, username: string): Promise<{ modifiedCount: number }> {
    const objectId = new Types.ObjectId(userNotificationId);

    const result = await this.userNotificationModel.updateOne(
      { _id: objectId, username, readAt: null },
      { $set: { readAt: new Date() } },
      { timestamps: false },
    );

    return { modifiedCount: result.modifiedCount };
  }

  async markAllAsRead(username: string): Promise<{ modifiedCount: number }> {
    const result = await this.userNotificationModel.updateMany(
      { username, readAt: null },
      { $set: { readAt: new Date() } },
      { timestamps: false },
    );

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

    const idsToDelete = orphanedIds.map((document) => new Types.ObjectId(document.id));
    const result = await this.notificationModel.deleteMany({ _id: { $in: idsToDelete } });

    if (result.deletedCount > 0) {
      Logger.log(`Cleaned up ${result.deletedCount} orphaned notifications`, NotificationsService.name);
    }

    return result.deletedCount;
  }

  async deleteAllUserNotifications(username: string, type: NotificationFilterType): Promise<number> {
    if (type === NOTIFICATION_FILTER_TYPE.ALL) {
      const userNotifications = await this.userNotificationModel.find({ username }, { notificationId: 1 }).exec();
      const notificationIdsToCheck = userNotifications.map((userNotification) => userNotification.notificationId);

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

    const notificationIds = userNotificationsData.map((document) => document.notificationId);
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
    name: 'CleanupOrphanedUserNotifications',
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

      const idsToDelete = orphanedUserNotifications.map((document) => new Types.ObjectId(document.id));
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
