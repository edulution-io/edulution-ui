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

import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import AIChatRequestDto from '@libs/chat/types/ai.chat.request.dto';
import { pipeTextStreamToResponse } from 'ai';
import { CHAT_AI_CONFIG_ENDPOINT, CHAT_AI_ENDPOINT, CHAT_AI_STREAM_ENDPOINT } from '@libs/chat/constants/chatEndpoints';
import AIService from './ai.service';

@Controller(CHAT_AI_ENDPOINT)
@ApiBearerAuth()
class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post(CHAT_AI_STREAM_ENDPOINT)
  streamChat(@Body() body: AIChatRequestDto, @Res() res: Response) {
    const { messages } = body;

    try {
      const result = this.aiService.streamChat(messages);

      pipeTextStreamToResponse({
        response: res,
        textStream: result.textStream,
      });
    } catch (error) {
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: error instanceof Error ? error.message : 'AI request failed',
        });
      }
    }
  }

  @Get(CHAT_AI_CONFIG_ENDPOINT)
  getConfig() {
    return this.aiService.getConfig();
  }
}

export default AIController;
