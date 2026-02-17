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
import CreateAiServiceDto from '@libs/aiService/types/createAiServiceDto';
import FetchAiModelsDto from '@libs/aiService/types/fetchAiModelsDto';
import AdminGuard from '../common/guards/admin.guard';
import AiServiceService from './ai-service.service';

@ApiTags('ai-service')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('ai-service')
class AiServiceController {
  constructor(private readonly aiServiceService: AiServiceService) {}

  @Get()
  findAll() {
    return this.aiServiceService.findAll();
  }

  @Post()
  create(@Body() dto: CreateAiServiceDto) {
    return this.aiServiceService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateAiServiceDto) {
    return this.aiServiceService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.aiServiceService.delete(id);
  }

  @Post('models')
  fetchAvailableModels(@Body() body: FetchAiModelsDto) {
    return AiServiceService.fetchAvailableModels(body);
  }
}

export default AiServiceController;
