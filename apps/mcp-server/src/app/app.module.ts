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

import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule } from '@rekog/mcp-nest';
import { JwtModule } from '@nestjs/jwt';
import JwtAuthGuard from '@backend-common/guards/jwt-auth.guard';
import GreetingTool from '../tools/greeting.tool';
import UsersTool from '../tools/users.tool';
import GroupsTool from '../tools/groups.tool';
import FilesharingTool from '../tools/filesharing.tool';
import MailTool from '../tools/mail.tool';
import ChatTool from '../tools/chat.tool';
import BulletinTool from '../tools/bulletin.tool';
import SurveyTool from '../tools/survey.tool';
import ConferenceTool from '../tools/conference.tool';
import LmnTool from '../tools/lmn.tool';
import SettingsTool from '../tools/settings.tool';
import AiTool from '../tools/ai.tool';
import DockerTool from '../tools/docker.tool';
import VdiTool from '../tools/vdi.tool';
import VeyonTool from '../tools/veyon.tool';
import WebdavSharesTool from '../tools/webdav-shares.tool';
import UserPreferencesTool from '../tools/user-preferences.tool';
import AppTool from '../tools/app.tool';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['apps/mcp-server/.env', 'apps/mcp-server/.env.default'],
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
    }),
    McpModule.forRoot({
      name: 'edu-mcp-server',
      version: '1.0.0',
      guards: [JwtAuthGuard],
    }),
  ],
  providers: [
    GreetingTool,
    UsersTool,
    GroupsTool,
    FilesharingTool,
    MailTool,
    ChatTool,
    BulletinTool,
    SurveyTool,
    ConferenceTool,
    LmnTool,
    SettingsTool,
    AiTool,
    DockerTool,
    VdiTool,
    VeyonTool,
    WebdavSharesTool,
    UserPreferencesTool,
    AppTool,
    JwtAuthGuard,
  ],
  exports: [JwtModule],
})
export default class AppModule {}
