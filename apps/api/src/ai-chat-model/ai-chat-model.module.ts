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

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AiServiceModule from '../ai-service/ai-service.module';
import AiChatModelController from './ai-chat-model.controller';
import AiChatModelService from './ai-chat-model.service';
import { AiChatModel, AiChatModelSchema } from './ai-chat-model.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AiChatModel.name, schema: AiChatModelSchema }]), AiServiceModule],
  controllers: [AiChatModelController],
  providers: [AiChatModelService],
  exports: [AiChatModelService],
})
export default class AiChatModelModule {}
