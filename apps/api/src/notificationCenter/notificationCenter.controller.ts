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

import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import CreateAnnouncementDto from '@libs/notification-center/types/create-announcement.dto';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import NOTIFICATION_CENTER_API_ENDPOINTS from '@libs/notification-center/constants/notificationCenterApiEndpoints';
import NotificationCenterService from './notificationCenter.service';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';

@Controller(NOTIFICATION_CENTER_API_ENDPOINTS.BASE)
@ApiBearerAuth()
class NotificationCenterController {
  constructor(private readonly notificationCenterService: NotificationCenterService) {}

  @Post()
  async create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
    @GetCurrentUser() currentUser: JwtUser,
  ): Promise<{ success: boolean }> {
    await this.notificationCenterService.create(createAnnouncementDto, currentUser);
    return { success: true };
  }

  @Get('can-create')
  async canCreate(@GetCurrentUser() currentUser: JwtUser): Promise<boolean> {
    return this.notificationCenterService.canCreateAnnouncement(currentUser);
  }

  @Get()
  async findMyAnnouncements(@GetCurrentUsername() currentUsername: string) {
    return this.notificationCenterService.findCreatedAnnouncements(currentUsername);
  }

  @Delete()
  removeAnnouncements(@GetCurrentUser() currentUser: JwtUser, @Body() ids: string[]) {
    return this.notificationCenterService.removeAnnouncements(currentUser, ids);
  }
}

export default NotificationCenterController;
