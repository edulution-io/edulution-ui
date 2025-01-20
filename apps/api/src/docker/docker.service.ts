import { Injectable, Logger, OnModuleDestroy, OnModuleInit, MessageEvent, HttpStatus } from '@nestjs/common';
import Docker from 'dockerode';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Response } from 'express';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import type TDockerCommands from '@libs/docker/types/TDockerCommands';
import CustomHttpException from '@libs/error/CustomHttpException';
import DockerErrorMessages from '@libs/docker/constants/dockerErrorMessages';
import DOCKER_COMMANDS from '@libs/docker/constants/dockerCommands';
import delay from '@libs/common/utils/delay';
import SseService from '../sse/sse.service';
import type UserConnections from '../types/userConnections';

@Injectable()
class DockerService implements OnModuleInit, OnModuleDestroy {
  private readonly dockerSocketPath = '/var/run/docker.sock';

  private readonly docker = new Docker({ socketPath: this.dockerSocketPath });

  private eventSubscription: Subscription;

  private dockerSseConnection: UserConnections = new Map();

  onModuleInit() {
    this.listenToDockerEvents();
  }

  onModuleDestroy() {
    this.closeEventStream();
  }

  subscribe(username: string, res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.dockerSseConnection, res);
  }

  private listenToDockerEvents() {
    this.docker.getEvents((error, stream) => {
      if (error || !stream) {
        Logger.error('Docker stream error', DockerService.name);
        return;
      }

      const dockerEvents$ = fromEvent(stream, 'data').pipe(
        map((chunk) => JSON.parse((chunk as Buffer<ArrayBufferLike>).toString()) as DockerEvent),
        filter((event) => {
          if (!event || event.Type !== 'container') {
            return false;
          }
          const ignoredActions = ['exec_create', 'exec_start', 'exec_die'];
          const actionName = event.Action.split(':')[0].trim();
          return !ignoredActions.includes(actionName);
        }),
      );

      this.eventSubscription = dockerEvents$.subscribe({
        next: (event) => {
          SseService.sendEventToUsers(['global-admin'], this.dockerSseConnection, event, SSE_MESSAGE_TYPE.MESSAGE);
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

  async getContainers() {
    try {
      const containers = await this.docker.listContainers({ all: true });
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
      SseService.sendEventToUsers(
        ['global-admin'],
        this.dockerSseConnection,
        { status: '', progress: 'Pulling image...' } as DockerEvent,
        SSE_MESSAGE_TYPE.MESSAGE,
      );
      const stream = await this.docker.pull(image);
      await new Promise<void>((resolve, reject) => {
        this.docker.modem.followProgress(
          stream,
          (error) => (error ? reject(error) : resolve()),
          (event: DockerEvent) => {
            if (event) {
              SseService.sendEventToUsers(['global-admin'], this.dockerSseConnection, event, SSE_MESSAGE_TYPE.MESSAGE);
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

  async createContainer(createContainerDto: Docker.ContainerCreateOptions) {
    const { Image } = createContainerDto;
    if (!Image) {
      return [];
    }
    try {
      SseService.sendEventToUsers(
        ['global-admin'],
        this.dockerSseConnection,
        { status: '', progress: 'Check if image already exists...' } as DockerEvent,
        SSE_MESSAGE_TYPE.MESSAGE,
      );
      const images = await this.docker.listImages();
      const imageExists = images.some((img) => img.RepoTags?.includes(Image));

      if (!imageExists) {
        await this.pullImage(Image);
      }
      SseService.sendEventToUsers(
        ['global-admin'],
        this.dockerSseConnection,
        { status: '', progress: 'Create container...' } as DockerEvent,
        SSE_MESSAGE_TYPE.MESSAGE,
      );

      const container = await this.docker.createContainer(createContainerDto);

      const containers = await this.executeContainerCommand({ id: container.id, operation: DOCKER_COMMANDS.START });
      return containers;
    } catch (error) {
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_CREATION_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        DockerService.name,
      );
    } finally {
      SseService.sendEventToUsers(
        ['global-admin'],
        this.dockerSseConnection,
        { status: '', progress: 'Done' } as DockerEvent,
        SSE_MESSAGE_TYPE.MESSAGE,
      );
    }
  }

  async executeContainerCommand(params: { id: string; operation: TDockerCommands }) {
    const { id, operation } = params;
    try {
      switch (operation) {
        case DOCKER_COMMANDS.START:
          await this.docker.getContainer(id).start();
          break;
        case DOCKER_COMMANDS.STOP:
          await this.docker.getContainer(id).stop();
          await delay(2000);
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

      const containers = await this.getContainers();
      return containers;
    } catch (error) {
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_COMMAND_EXECUTION_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        DockerService.name,
      );
    } finally {
      SseService.sendEventToUsers(
        ['global-admin'],
        this.dockerSseConnection,
        { status: '', progress: `${operation} container ...` } as DockerEvent,
        SSE_MESSAGE_TYPE.MESSAGE,
      );
    }
  }

  async deleteContainer(id: string) {
    try {
      await this.docker.getContainer(id).remove();
      await delay(5000);
      const containers = await this.getContainers();
      return containers;
    } catch (error) {
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_CONTAINER_DELETION_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        DockerService.name,
      );
    } finally {
      SseService.sendEventToUsers(
        ['global-admin'],
        this.dockerSseConnection,
        { status: '', progress: `Container ${id} deleted` } as DockerEvent,
        SSE_MESSAGE_TYPE.MESSAGE,
      );
    }
  }
}

export default DockerService;
