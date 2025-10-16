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

import { HttpStatus, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Docker from 'dockerode';
import { fromEvent, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import DockerErrorMessages from '@libs/docker/constants/dockerErrorMessages';
import DOCKER_COMMANDS from '@libs/docker/constants/dockerCommands';
import DOCKER_PROTECTED_CONTAINERS from '@libs/docker/constants/dockerProtectedContainer';
import SPECIAL_USERS from '@libs/common/constants/specialUsers';
import type TDockerProtectedContainer from '@libs/docker/types/TDockerProtectedContainer';
import CONTAINER from '@libs/docker/constants/container';
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

  private async pullImage(image: string) {
    try {
      this.sseService.sendEventToUsers(
        [SPECIAL_USERS.GLOBAL_ADMIN],
        { progress: 'docker.events.pullingImage', from: `${image}` } as DockerEvent,
        SSE_MESSAGE_TYPE.CONTAINER_PROGRESS,
      );
      const stream = await this.docker.pull(image);
      await new Promise<void>((resolve, reject) => {
        this.docker.modem.followProgress(
          stream,
          (error) => (error ? reject(error) : resolve()),
          (event: DockerEvent) => {
            if (event) {
              this.sseService.sendEventToUsers([SPECIAL_USERS.GLOBAL_ADMIN], event, SSE_MESSAGE_TYPE.CONTAINER_STATUS);
            }
          },
        );
      });
    } catch (error) {
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_IMAGE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        undefined,
        DockerService.name,
      );
    }
  }

  private async imageExists(imageName: string): Promise<boolean> {
    const images = await this.docker.listImages();

    this.sseService.sendEventToUsers(
      [SPECIAL_USERS.GLOBAL_ADMIN],
      { progress: 'docker.events.checkingImage', from: `${imageName}` } as DockerEvent,
      SSE_MESSAGE_TYPE.CONTAINER_PROGRESS,
    );

    return images.some((img) => img.RepoTags?.includes(imageName));
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

  async createContainer(createContainersDto: Docker.ContainerCreateOptions[]) {
    const newCreateContainersDto = DockerService.replaceEnvVariables(createContainersDto);
    try {
      await Promise.all(
        newCreateContainersDto.map(async (containerDto) => {
          const { Image } = containerDto;
          if (Image) {
            const imageExists = await this.imageExists(Image);
            if (!imageExists) {
              await this.pullImage(Image);
            }
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

    DockerService.checkProtectedContainer(id);

    try {
      this.sseService.sendEventToUsers(
        [SPECIAL_USERS.GLOBAL_ADMIN],
        { progress: `docker.events.${operation}Container`, from: id } as DockerEvent,
        SSE_MESSAGE_TYPE.CONTAINER_PROGRESS,
      );
      switch (operation) {
        case DOCKER_COMMANDS.START:
          await this.docker.getContainer(id).start();
          break;
        case DOCKER_COMMANDS.STOP:
          await this.docker.getContainer(id).stop();
          break;
        case DOCKER_COMMANDS.RESTART:
          await this.docker.getContainer(id).restart();
          break;
        case DOCKER_COMMANDS.KILL:
          await this.docker.getContainer(id).kill();
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
            cpuPercent: +cpuPercent.toFixed(2),
            memUsageMB: +(data.memory_stats.usage / 1024 / 1024).toFixed(1),
            memLimitMB: +(data.memory_stats.limit / 1024 / 1024).toFixed(1),
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          return { id: container.Id.slice(0, 12), error: message };
        }
      }),
    );
  }
}

export default DockerService;
