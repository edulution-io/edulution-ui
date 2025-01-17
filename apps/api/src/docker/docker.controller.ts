import { Body, Controller, Get, Param, Post, Put, Res, Sse, UseGuards, MessageEvent, Delete } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { type ContainerCreateOptions } from 'dockerode';
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import DockerService from './docker.service';
import AppConfigGuard from '../appconfig/appconfig.guard';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

@Controller('docker')
class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @Get('containers')
  @UseGuards(AppConfigGuard)
  async getContainers() {
    return this.dockerService.getContainers();
  }

  @Post('containers')
  @UseGuards(AppConfigGuard)
  async createContainer(@Body() createContainerDto: ContainerCreateOptions) {
    return this.dockerService.createContainer(createContainerDto);
  }

  @Put('containers/:id/:operation')
  @UseGuards(AppConfigGuard)
  async executeContainerCommand(@Param() params: { id: string; operation: TDockerCommands }) {
    return this.dockerService.executeContainerCommand(params);
  }

  @Sse('sse')
  @UseGuards(AppConfigGuard)
  sse(@GetCurrentUsername() username: string, @Res() res: Response): Observable<MessageEvent> {
    return this.dockerService.subscribe(username, res);
  }

  @Delete('containers/:id')
  @UseGuards(AppConfigGuard)
  async deleteContainer(@Param('id') id: string) {
    return this.dockerService.deleteContainer(id);
  }
}

export default DockerController;
