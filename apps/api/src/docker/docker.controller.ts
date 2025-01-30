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
