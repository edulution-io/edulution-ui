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

import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CreateAiAssistantDto from '@libs/aiAssistant/types/createAiAssistantDto';
import APPS from '@libs/appconfig/constants/apps';
import AdminGuard from '../common/guards/admin.guard';
import RequireAppAccess from '../common/decorators/requireAppAccess.decorator';
import AiAssistantService from './ai-assistant.service';

@ApiTags('ai-assistant')
@ApiBearerAuth()
@RequireAppAccess(APPS.CHAT)
@Controller('ai-assistant')
class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.aiAssistantService.findAll();
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateAiAssistantDto) {
    return this.aiAssistantService.create(dto);
  }

  @Get(':name')
  @UseGuards(AdminGuard)
  async checkName(@Param('name') name: string): Promise<{ exists: boolean }> {
    return this.aiAssistantService.checkIfNameExists(name);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: CreateAiAssistantDto) {
    return this.aiAssistantService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  delete(@Param('id') id: string) {
    return this.aiAssistantService.delete(id);
  }
}

export default AiAssistantController;
