import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import DockerService from './docker.service';
import AppConfigGuard from '../appconfig/appconfig.guard';

@Controller('docker')
class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @Get('containers')
  async getContainers() {
    return this.dockerService.getContainers();
  }

  @Post('images')
  @UseGuards(AppConfigGuard)
  async pullImage(@Query('fromImage') fromImage: string, @Query('tag') tag: string) {
    return this.dockerService.pullImage(fromImage, tag);
  }

  @Post('containers')
  @UseGuards(AppConfigGuard)
  async createContainer(@Body() createContainerDto: { image: string }) {
    return this.dockerService.createContainer(createContainerDto);
  }

  @Put('containers/:id/:operation')
  @UseGuards(AppConfigGuard)
  async executeContainerCommand(@Param() params: { id: string; operation: string }) {
    return this.dockerService.executeContainerCommand(params);
  }
}

export default DockerController;
