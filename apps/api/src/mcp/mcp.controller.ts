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

import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  MCP_CONFIG_ENDPOINT,
  MCP_ENDPOINT,
  MCP_TEST_CONNECTION_ENDPOINT,
  MCP_TOOLS_ENDPOINT,
} from '@libs/mcp/constants/mcpEndpoints';
import GetToken from '@backend-common/decorators/get-token.decorator';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import McpConfigDto from '@libs/mcp/types/mcpConfigDto';
import { GetCurrentUser } from '@backend-common/decorators';
import TestMcpConnectionDto from '@libs/mcp/types/test-mcp-connection.dto';
import McpService from './mcp.service';
import AdminGuard from '../common/guards/admin.guard';
import McpConfigService from './mcpConfigService';

@Controller(MCP_ENDPOINT)
@ApiBearerAuth()
class McpController {
  constructor(
    private readonly mcpService: McpService,
    private readonly mcpConfigService: McpConfigService,
  ) {}

  @Get(MCP_TOOLS_ENDPOINT)
  async getToolsForUser(@GetCurrentUser() user: JWTUser, @GetToken() token: string) {
    const configs = await this.mcpConfigService.getByUserAccess(user.preferred_username, user.ldapGroups);

    const allTools = await Promise.all(
      configs.map(async (config) => {
        const tools = await this.mcpService.listTools(config.url, token);
        return tools.map((tool) => ({ ...tool, configId: config.id, configName: config.name }));
      }),
    );

    return allTools.flat();
  }

  @Post(MCP_TEST_CONNECTION_ENDPOINT)
  @UseGuards(AdminGuard)
  async testConnection(@Body() dto: TestMcpConnectionDto, @GetToken() token: string) {
    return this.mcpService.testConnection(dto.url, token);
  }

  @Get(MCP_CONFIG_ENDPOINT)
  @UseGuards(AdminGuard)
  async getAllConfigs() {
    return this.mcpConfigService.getAll();
  }

  @Get(`${MCP_CONFIG_ENDPOINT}/:id`)
  @UseGuards(AdminGuard)
  async getConfig(@Param('id') id: string) {
    return this.mcpConfigService.getById(id);
  }

  @Post(MCP_CONFIG_ENDPOINT)
  @UseGuards(AdminGuard)
  async createConfig(@Body() dto: McpConfigDto) {
    return this.mcpConfigService.create(dto);
  }

  @Put(`${MCP_CONFIG_ENDPOINT}/:id`)
  @UseGuards(AdminGuard)
  async updateConfig(@Param('id') id: string, @Body() dto: McpConfigDto) {
    return this.mcpConfigService.update(id, dto);
  }

  @Delete(`${MCP_CONFIG_ENDPOINT}/:id`)
  @UseGuards(AdminGuard)
  async deleteConfig(@Param('id') id: string) {
    return this.mcpConfigService.delete(id);
  }
}

export default McpController;
