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

import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { type ContainerCreateOptions } from 'dockerode';
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import { EDU_API_DOCKER_CONTAINER_ENDPOINT, EDU_API_DOCKER_ENDPOINT } from '@libs/docker/constants/dockerEndpoints';
import DockerService from './docker.service';
import AdminGuard from '../common/guards/admin.guard';

@Controller(EDU_API_DOCKER_ENDPOINT)
@UseGuards(AdminGuard)
class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @Get(EDU_API_DOCKER_CONTAINER_ENDPOINT)
  async getContainers(@Query('applicationNames') applicationNames?: string | string[] | undefined) {
    return this.dockerService.getContainers(applicationNames);
  }

  @Post(EDU_API_DOCKER_CONTAINER_ENDPOINT)
  async createContainer(@Body() createContainersDto: ContainerCreateOptions[]) {
    return this.dockerService.createContainer(createContainersDto);
  }

  @Put(`${EDU_API_DOCKER_CONTAINER_ENDPOINT}/:id/:operation`)
  async executeContainerCommand(@Param() params: { id: string; operation: TDockerCommands }) {
    return this.dockerService.executeContainerCommand(params);
  }

  @Delete(`${EDU_API_DOCKER_CONTAINER_ENDPOINT}/:id`)
  async deleteContainer(@Param('id') id: string) {
    return this.dockerService.deleteContainer(id);
  }

  @Patch(`${EDU_API_DOCKER_CONTAINER_ENDPOINT}/:id`)
  async updateContainer(@Param('id') id: string) {
    return this.dockerService.updateContainer(id);
  }
}

export default DockerController;
