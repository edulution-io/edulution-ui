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

import { HttpStatus, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Docker from 'dockerode';
import { fromEvent, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import { join } from 'path';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import DockerErrorMessages from '@libs/docker/constants/dockerErrorMessages';
import DOCKER_COMMANDS from '@libs/docker/constants/dockerCommands';
import DOCKER_PROTECTED_CONTAINERS from '@libs/docker/constants/dockerProtectedContainer';
import SPECIAL_USERS from '@libs/common/constants/specialUsers';
import type TDockerProtectedContainer from '@libs/docker/types/TDockerProtectedContainer';
import type UpdateContainerResponse from '@libs/docker/types/updateContainerResponse';
import CONTAINER from '@libs/docker/constants/container';
import type PullEvent from '@libs/docker/types/pullEvent';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import type CreateContainerDto from '@libs/docker/types/create-container.dto';
import CustomHttpException from '../common/CustomHttpException';
import SseService from '../sse/sse.service';

@Injectable()
class DockerService implements OnModuleInit, OnModuleDestroy {
  // TODO: Add possiblity to use docker api as well https://github.com/edulution-io/edulution-ui/issues/396
  private readonly dockerSocketPath = '/var/run/docker.sock';

  private readonly docker = new Docker({ socketPath: this.dockerSocketPath });

  private eventSubscription: Subscription;

  constructor(private readonly sseService: SseService) {}

  onModuleInit() {
    this.listenToDockerEvents();
  }

  onModuleDestroy() {
    this.closeEventStream();
  }

  private listenToDockerEvents() {
    this.docker.getEvents((error: Error, stream) => {
      if (error) {
        Logger.error(`Docker getEvents failed: ${error.stack || error.message}`, DockerService.name);
        return;
      }
      if (!stream) {
        Logger.error('Docker getEvents returned no stream object', DockerService.name);
        return;
      }
      stream.on('error', (err: Error) =>
        Logger.error(`Docker event‐stream error: ${err.stack || err.message}`, DockerService.name),
      );

      const dockerEvents$ = fromEvent(stream, 'data').pipe(
        map((chunk) => JSON.parse((chunk as Buffer<ArrayBufferLike>).toString()) as DockerEvent),
        filter((event) => {
          if (!event || event.Type !== CONTAINER) {
            return false;
          }
          const ignoredActions = ['exec_create', 'exec_start', 'exec_die'];
          const actionName = event.Action.split(':')[0].trim();
          return !ignoredActions.includes(actionName);
        }),
      );

      this.eventSubscription = dockerEvents$.subscribe({
        next: (event) => {
          this.sseService.sendEventToUsers([SPECIAL_USERS.GLOBAL_ADMIN], event, SSE_MESSAGE_TYPE.CONTAINER_STATUS);
          this.getContainers()
            .then((containers) =>
              this.sseService.sendEventToUsers(
                [SPECIAL_USERS.GLOBAL_ADMIN],
                containers,
                SSE_MESSAGE_TYPE.CONTAINER_UPDATE,
              ),
            )
            .catch((e) => Logger.error(e instanceof Error ? e.message : 'Get containers failed', DockerService.name));
        },
        error: () => Logger.error('Docker stream error', DockerService.name),
        complete: () => Logger.log('Close docker event stream', DockerService.name),
      });
    });
  }

  private closeEventStream() {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
      Logger.log('Close docker event stream', DockerService.name);
    }
  }

  async getContainers(applicationNames?: string | string[]) {
    try {
      let filters = {};
      if (applicationNames) {
        const applicationNamesArray = Array.isArray(applicationNames) ? applicationNames : [applicationNames];
        const formattedNames = applicationNamesArray.map((name) => `/${name}`);
        filters = {
          name: formattedNames,
        };
      }

      const containers = await this.docker.listContainers({
        all: true,
        filters,
      });

      return containers;
    } catch (error) {
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_CONNECTION_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        DockerService.name,
      );
    }
  }

  private async pullImage(image: string): Promise<boolean> {
    try {
      this.sseService.sendEventToUsers(
        [SPECIAL_USERS.GLOBAL_ADMIN],
        {
          progress: 'docker.events.pullingImage',
          from: image,
        } as DockerEvent,
        SSE_MESSAGE_TYPE.CONTAINER_PROGRESS,
      );

      const stream = await this.docker.pull(image);

      const pullEvents: PullEvent[] = [];

      await new Promise<void>((resolve, reject) => {
        this.docker.modem.followProgress(
          stream,
          (error, output: PullEvent[]) => {
            if (error) {
              reject(error);
              return;
            }

            if (Array.isArray(output)) {
              output.forEach((o) => pullEvents.push(o));
            }

            resolve();
          },
          (event: PullEvent) => {
            pullEvents.push(event);

            this.sseService.sendEventToUsers([SPECIAL_USERS.GLOBAL_ADMIN], event, SSE_MESSAGE_TYPE.CONTAINER_STATUS);
          },
        );
      });

      const updated = pullEvents.some(
        (evt) => typeof evt.status === 'string' && evt.status.includes('Downloaded newer image'),
      );

      if (updated) {
        Logger.debug(`Image ${image} pulled and updated`, DockerService.name);
        return true;
      }

      const upToDate = pullEvents.some(
        (evt) => typeof evt.status === 'string' && evt.status.includes('Image is up to date'),
      );

      if (upToDate) {
        Logger.debug(`Image ${image} is up to date`, DockerService.name);
        return false;
      }

      return true;
    } catch (error) {
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_IMAGE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        undefined,
        DockerService.name,
      );
    }
  }

  static replaceEnvVariables(createContainersDto: Docker.ContainerCreateOptions[]) {
    let newCreateContainersDto: Docker.ContainerCreateOptions[] = [];
    newCreateContainersDto = createContainersDto.map((service) => ({
      ...service,
      Env: service.Env?.map((env) =>
        env.replace(/\${([^}]+)}/g, (match, varName: string) => process.env[varName] || match),
      ),
    }));

    return newCreateContainersDto;
  }

  private static saveDockerCompose(appname: string, composeConfig: string): void {
    try {
      const fileDir = join(APPS_FILES_PATH, appname);
      ensureDirSync(fileDir);
      const filePath = join(APPS_FILES_PATH, appname, 'docker-compose.yml');

      writeFileSync(filePath, composeConfig, 'utf-8');
      Logger.log(`Docker compose file saved: ${filePath}`, DockerService.name);
    } catch (error) {
      Logger.error(
        `Failed to save docker-compose.yml: ${error instanceof Error ? error.message : String(error)}`,
        DockerService.name,
      );
    }
  }

  async createContainer(createContainerDto: CreateContainerDto) {
    const { applicationName, containers, originalComposeConfig } = createContainerDto;

    const newCreateContainersDto = DockerService.replaceEnvVariables(containers);

    try {
      await Promise.all(
        newCreateContainersDto.map(async (containerDto) => {
          const { Image } = containerDto;
          if (Image) {
            await this.pullImage(Image);
          }
        }),
      );

      await Promise.all(
        newCreateContainersDto.map(async (containerDto) => {
          this.sseService.sendEventToUsers(
            [SPECIAL_USERS.GLOBAL_ADMIN],
            { progress: 'docker.events.creatingContainer', from: `${containerDto.name}` } as DockerEvent,
            SSE_MESSAGE_TYPE.CONTAINER_PROGRESS,
          );
          const container = await this.docker.createContainer(containerDto);
          await container.start();
          Logger.log(`Container ${containerDto.name} created and started.`, DockerService.name);

          if (applicationName && originalComposeConfig) {
            DockerService.saveDockerCompose(applicationName, originalComposeConfig);
          }
        }),
      );

      this.sseService.sendEventToUsers(
        [SPECIAL_USERS.GLOBAL_ADMIN],
        { progress: 'docker.events.containerCreationSuccessful', from: DockerService.name } as DockerEvent,
        SSE_MESSAGE_TYPE.CONTAINER_PROGRESS,
      );
    } catch (error) {
      this.sseService.sendEventToUsers(
        [SPECIAL_USERS.GLOBAL_ADMIN],
        { progress: 'docker.events.containerCreationFailed', from: DockerService.name } as DockerEvent,
        SSE_MESSAGE_TYPE.CONTAINER_PROGRESS,
      );
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_CREATION_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        DockerService.name,
      );
    }
  }

  static checkProtectedContainer(id: string) {
    const isSelectedContainerProtected = Object.values(DOCKER_PROTECTED_CONTAINERS).includes(
      id as TDockerProtectedContainer,
    );
    if (isSelectedContainerProtected) {
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_COMMAND_EXECUTION_ERROR,
        HttpStatus.FORBIDDEN,
        undefined,
        DockerService.name,
      );
    }
  }

  async executeContainerCommand(params: { id: string; operation: TDockerCommands }) {
    const { id, operation } = params;
    const container = this.docker.getContainer(id);

    DockerService.checkProtectedContainer(id);

    try {
      this.sseService.sendEventToUsers(
        [SPECIAL_USERS.GLOBAL_ADMIN],
        { progress: `docker.events.${operation}Container`, from: id } as DockerEvent,
        SSE_MESSAGE_TYPE.CONTAINER_PROGRESS,
      );
      switch (operation) {
        case DOCKER_COMMANDS.START:
          await container.start();
          break;
        case DOCKER_COMMANDS.STOP:
          await container.stop();
          break;
        case DOCKER_COMMANDS.RESTART:
          await container.restart();
          break;
        case DOCKER_COMMANDS.KILL:
          await container.kill();
          break;
        default:
          throw new CustomHttpException(
            DockerErrorMessages.DOCKER_COMMAND_EXECUTION_ERROR,
            HttpStatus.INTERNAL_SERVER_ERROR,
            undefined,
            DockerService.name,
          );
      }
    } catch (error) {
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_COMMAND_EXECUTION_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        DockerService.name,
      );
    }
  }

  async deleteContainer(id: string) {
    DockerService.checkProtectedContainer(id);
    try {
      await this.docker.getContainer(id).remove();
    } catch (error) {
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_CONTAINER_DELETION_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        DockerService.name,
      );
    }
  }

  async getContainerStats() {
    const containers = await this.getContainers();

    return Promise.all(
      containers.map(async (container) => {
        try {
          const c = this.docker.getContainer(container.Id);
          const data = await c.stats({ stream: false });

          const cpuDelta = data.cpu_stats.cpu_usage.total_usage - data.precpu_stats.cpu_usage.total_usage;
          const systemDelta = data.cpu_stats.system_cpu_usage - data.precpu_stats.system_cpu_usage;
          const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * data.cpu_stats.online_cpus * 100 : 0;

          return {
            id: container.Id.slice(0, 12),
            name: container.Names[0].replace('/', ''),
            image: container.Image,
            cpuPercent: +cpuPercent.toFixed(2),
            memUsageMB: +(data.memory_stats.usage / 1024 / 1024).toFixed(1),
            memLimitMB: +(data.memory_stats.limit / 1024 / 1024).toFixed(1),
          };
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return { id: container.Id.slice(0, 12), error: message };
        }
      }),
    );
  }

  async updateContainer(containerId: string): Promise<UpdateContainerResponse> {
    try {
      const container = this.docker.getContainer(containerId);

      const inspectData = await container.inspect();
      const imageName = inspectData.Config.Image;

      Logger.debug('Pulling latest image:', DockerService.name);
      const isImageUpdated = await this.pullImage(imageName);

      if (!isImageUpdated) {
        Logger.debug(
          `Image ${imageName} is already up to date. No update needed for container ${container.id}`,
          DockerService.name,
        );
        return { id: container.id, isImageUpdated };
      }

      Logger.debug(`Stopping container ${container.id}`, DockerService.name);
      await container.stop();

      Logger.debug(`Removing container ${container.id}`, DockerService.name);
      await container.remove();

      Logger.debug(`Recreating container`, DockerService.name);
      const newContainer = await this.docker.createContainer({
        ...inspectData.Config,
        HostConfig: inspectData.HostConfig,
        NetworkingConfig: inspectData.NetworkSettings?.Networks
          ? { EndpointsConfig: inspectData.NetworkSettings.Networks }
          : undefined,
        Image: imageName,
        name: inspectData.Name.replace('/', ''),
      });

      Logger.debug('Starting new container...');
      await newContainer.start();

      return { id: newContainer.id, isImageUpdated };
    } catch (error) {
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_UPDATE_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        DockerService.name,
      );
    }
  }
}

export default DockerService;
