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
import JwtUser from '@libs/user/types/jwt/jwtUser';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import AllowedSenderDto from '@libs/notification-center/types/allowedSenderDto';
import APPS from '@libs/appconfig/constants/apps';
import CreateAnnouncementDto from '@libs/notification-center/types/create-announcement.dto';
import { ChannelsType } from '@libs/notification-center/types/channelsType';
import CHANNELS from '@libs/notification-center/constants/channels';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import AnnouncementDto from '@libs/notification-center/types/announcementDto';
import { Announcement } from './schemas/announcement.schema';
import NotificationsService from '../notifications/notifications.service';
import GroupsService from '../groups/groups.service';
import AppConfigService from '../appconfig/appconfig.service';

@Injectable()
class NotificationCenterService {
  private readonly logger = new Logger(NotificationCenterService.name);

  constructor(
    @InjectModel(Announcement.name) private announcementModel: Model<Announcement>,
    private readonly appConfigService: AppConfigService,
    private readonly groupsService: GroupsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, currentUser: JwtUser): Promise<void> {
    const {
      title,
      pushMessage,
      extendedMessage,
      recipientGroups = [],
      recipientUsers = [],
      channels = [],
    } = createAnnouncementDto;

    const recipients = await this.groupsService.getInvitedMembers(recipientGroups, recipientUsers);

    const filteredRecipients = recipients.filter((username) => username !== currentUser.name);

    await this.announcementModel.create({
      title,
      pushMessage,
      extendedMessage,
      channels,
      recipientGroups,
      recipientUsers,
      recipientsCount: filteredRecipients.length,
      creator: {
        firstName: currentUser.given_name,
        lastName: currentUser.family_name,
        username: currentUser.preferred_username,
      },
      status: undefined,
    });

    await Promise.all(channels.map((method) => this.sendByChannel(method, title, pushMessage, filteredRecipients)));
  }

  async findCreatedAnnouncements(username: string): Promise<AnnouncementDto[]> {
    return this.announcementModel
      .find<AnnouncementDto>({ 'creator.username': username })
      .sort({ createdAt: -1 })
      .exec();
  }

  async canCreateAnnouncement(currentUser: JwtUser): Promise<boolean> {
    const appConfig = await this.appConfigService.getAppConfigByName(APPS.NOTIFICATION_CENTER);

    const allowedSenders = appConfig?.extendedOptions?.[ExtendedOptionKeys.NOTIFICATION_CENTER_ALLOWED_CREATORS] as
      | AllowedSenderDto[]
      | undefined;

    if (!allowedSenders || allowedSenders.length === 0) {
      return false;
    }

    return allowedSenders.some((sender) => {
      const isInAllowedGroup = sender.allowedGroups?.some((group) => currentUser.ldapGroups?.includes(group.value));
      const isAllowedUser = sender.allowedUsers?.some((user) => user.value === currentUser.preferred_username);
      return isInAllowedGroup || isAllowedUser;
    });
  }

  private async sendByChannel(
    method: ChannelsType,
    title: string,
    message: string,
    recipients: string[],
  ): Promise<void> {
    switch (method) {
      case CHANNELS.PUSH:
        await this.sendPush(title, message, recipients);
        break;
      default:
        this.logger.warn(`Unknown delivery method: ${method}`);
    }
  }

  private async sendPush(title: string, message: string, recipients: string[]): Promise<void> {
    await this.notificationsService.notifyUsernames(recipients, {
      title,
      body: message,
    });
  }

  async removeAnnouncements(currentUser: JwtUser, ids: string[]): Promise<void> {
    await this.announcementModel
      .deleteMany({
        _id: { $in: ids },
        'creator.username': currentUser.preferred_username,
      })
      .exec();
  }
}

export default NotificationCenterService;
