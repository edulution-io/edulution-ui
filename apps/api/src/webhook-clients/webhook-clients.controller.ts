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

import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WEBHOOK_CLIENTS_ENDPOINT } from '@libs/webhook/constants/webhookApiEndpoint';
import AdminGuard from '../common/guards/admin.guard';
import WebhookClientsService from './webhook-clients.service';

@ApiTags(WEBHOOK_CLIENTS_ENDPOINT)
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller(WEBHOOK_CLIENTS_ENDPOINT)
class WebhookClientsController {
  constructor(private readonly webhookClientsService: WebhookClientsService) {}

  @Get()
  async getAll() {
    return this.webhookClientsService.getAll();
  }

  @Post()
  async create(@Body('userAgent') userAgent: string) {
    return this.webhookClientsService.create(userAgent);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.webhookClientsService.delete(id);
  }
}

export default WebhookClientsController;
