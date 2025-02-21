/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  Sse,
  UseGuards,
  MessageEvent,
  Delete,
  Query,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { type ContainerCreateOptions } from 'dockerode';
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import { EDU_API_DOCKER_ENDPOINT, EDU_API_DOCKER_CONTAINER_ENDPOINT } from '@libs/docker/constants/dockerEndpoints';
import DockerService from './docker.service';
import AppConfigGuard from '../appconfig/appconfig.guard';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

@Controller(EDU_API_DOCKER_ENDPOINT)
@UseGuards(AppConfigGuard)
class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @Get(EDU_API_DOCKER_CONTAINER_ENDPOINT)
  async getContainers(@Query('applicationNames') applicationNames?: string[] | undefined) {
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

  @Sse('sse')
  sse(@GetCurrentUsername() username: string, @Res() res: Response): Observable<MessageEvent> {
    return this.dockerService.subscribe(username, res);
  }

  @Delete(`${EDU_API_DOCKER_CONTAINER_ENDPOINT}/:id`)
  async deleteContainer(@Param('id') id: string) {
    return this.dockerService.deleteContainer(id);
  }
}

export default DockerController;
