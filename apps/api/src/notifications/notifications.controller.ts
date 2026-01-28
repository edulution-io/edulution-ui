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

import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NOTIFICATIONS_EDU_API_ENDPOINT } from '@libs/notification/constants/apiEndpoints';
import { NOTIFICATION_FILTER_TYPE, NotificationFilterType } from '@libs/notification/types/notificationFilterType';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import NotificationsService from './notifications.service';

@ApiTags(NOTIFICATIONS_EDU_API_ENDPOINT)
@ApiBearerAuth()
@Controller(NOTIFICATIONS_EDU_API_ENDPOINT)
class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  async getInbox(
    @GetCurrentUsername() username: string,
    @Query('limit') limitParam = '20',
    @Query('offset') offsetParam = '0',
  ) {
    const parsedLimit = parseInt(limitParam, 10);
    const limit = Math.min(50, Math.max(1, Number.isNaN(parsedLimit) ? 20 : parsedLimit));
    const parsedOffset = parseInt(offsetParam, 10);
    const offset = Math.max(0, Number.isNaN(parsedOffset) ? 0 : parsedOffset);
    return this.notificationsService.getInboxNotifications(username, limit, offset);
  }

  @Get('unread-count')
  async getUnreadCount(@GetCurrentUsername() username: string) {
    const count = await this.notificationsService.getUnreadCount(username);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') notificationId: string, @GetCurrentUsername() username: string) {
    await this.notificationsService.markAsRead(notificationId, username);
  }

  @Patch('read-all')
  async markAllAsRead(@GetCurrentUsername() username: string) {
    await this.notificationsService.markAllAsRead(username);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') notificationId: string, @GetCurrentUsername() username: string) {
    await this.notificationsService.deleteUserNotification(notificationId, username);
  }

  @Delete()
  @ApiQuery({
    name: 'type',
    required: false,
    enum: Object.values(NOTIFICATION_FILTER_TYPE),
    example: NOTIFICATION_FILTER_TYPE.ALL,
  })
  async deleteAllNotifications(
    @GetCurrentUsername() username: string,
    @Query('type') type: NotificationFilterType = NOTIFICATION_FILTER_TYPE.ALL,
  ) {
    const deletedCount = await this.notificationsService.deleteAllUserNotifications(username, type);
    return { deletedCount };
  }
}

export default NotificationsController;
