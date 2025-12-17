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

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import McpConfigDto from '@libs/mcp/types/mcpConfigDto';
import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import { CustomHttpException } from '@backend-common/exceptions';
import McpConfig, { McpConfigDocument } from './schemas/mcp-config.schema';

@Injectable()
class McpConfigService {
  constructor(@InjectModel(McpConfig.name) private mcpConfigModel: Model<McpConfigDocument>) {}

  async getAll(): Promise<McpConfigDto[]> {
    const configs = await this.mcpConfigModel.find();
    return configs.map((config) => config.toJSON() as unknown as McpConfigDto);
  }

  async getById(id: string): Promise<McpConfigDto | null> {
    const config = await this.mcpConfigModel.findById(id);
    return config ? (config.toJSON() as unknown as McpConfigDto) : null;
  }

  async create(config: Omit<McpConfigDto, 'id'>): Promise<McpConfigDto> {
    const created = await this.mcpConfigModel.create(config);
    return created.toJSON() as unknown as McpConfigDto;
  }

  async update(id: string, config: McpConfigDto): Promise<McpConfigDto> {
    const updated = await this.mcpConfigModel.findByIdAndUpdate(id, { $set: config }, { new: true });

    if (!updated) {
      throw new CustomHttpException(AppConfigErrorMessages.WriteAppConfigFailed, HttpStatus.NOT_FOUND);
    }

    return updated.toJSON() as unknown as McpConfigDto;
  }

  async delete(id: string): Promise<void> {
    const result = await this.mcpConfigModel.findByIdAndDelete(id);
    if (!result) {
      throw new CustomHttpException(AppConfigErrorMessages.WriteAppConfigFailed, HttpStatus.NOT_FOUND);
    }
  }

  async getByUserAccess(username: string, userGroups: string[]): Promise<McpConfigDto[]> {
    let groupPaths: string[] = [];

    if (Array.isArray(userGroups)) {
      groupPaths = userGroups
        .map((g) => {
          if (typeof g === 'string') {
            return g.startsWith('/') ? g : `/${g}`;
          }
          return '';
        })
        .filter(Boolean);
    }

    const query = {
      $or: [
        { 'allowedUsers.username': username },
        { 'allowedGroups.path': { $in: groupPaths } },
        { 'allowedGroups.name': { $in: userGroups } },
      ],
    };

    const configs = await this.mcpConfigModel.find(query);
    return configs.map((config) => config.toJSON() as unknown as McpConfigDto);
  }
}

export default McpConfigService;
