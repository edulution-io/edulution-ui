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

import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { NOTIFICATIONS_EDU_API_ENDPOINT } from '@libs/notification/constants/apiEndpoints';
import NotificationsService from './notifications.service';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';

@Controller(NOTIFICATIONS_EDU_API_ENDPOINT)
class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getAll(
    @GetCurrentUsername() username: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.notificationsService.getByUsername(username, {
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });
  }

  @Get(':id')
  async getOne(@GetCurrentUsername() username: string, @Param('id') id: string) {
    return this.notificationsService.getById(username, id);
  }

  @Delete(':id')
  async delete(@GetCurrentUsername() username: string, @Param('id') id: string) {
    return this.notificationsService.delete(username, id);
  }
}

export default NotificationsController;
