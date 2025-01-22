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
          this.getContainers()
            .then((containers) =>
              SseService.sendEventToUsers(
                ['global-admin'],
                this.dockerSseConnection,
                containers,
                SSE_MESSAGE_TYPE.UPDATED,
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
        { status: '', progress: 'docker.events.pullingImage' } as DockerEvent,
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

  private async imageExists(imageName: string): Promise<boolean> {
    const images = await this.docker.listImages();

    SseService.sendEventToUsers(
      ['global-admin'],
      this.dockerSseConnection,
      { status: '', progress: 'docker.events.checkingImage' } as DockerEvent,
      SSE_MESSAGE_TYPE.MESSAGE,
    );

    return images.some((img) => img.RepoTags?.includes(imageName));
  }

  async createContainer(createContainerDto: Docker.ContainerCreateOptions[]) {
    try {
      await Promise.all(
        createContainerDto.map(async (containerDto) => {
          const { Image } = containerDto;
          if (Image) {
            const imageExists = await this.imageExists(Image);
            if (!imageExists) {
              await this.pullImage(Image);
            }
          }
        }),
      );

      SseService.sendEventToUsers(
        ['global-admin'],
        this.dockerSseConnection,
        { status: '', progress: 'docker.events.creatingContainer' } as DockerEvent,
        SSE_MESSAGE_TYPE.MESSAGE,
      );

      await Promise.all(
        createContainerDto.map(async (containerDto) => {
          const container = await this.docker.createContainer(containerDto);
          await container.start();
          Logger.log(`Container ${containerDto.name} created and started.`);
        }),
      );
    } catch (error) {
      throw new CustomHttpException(
        DockerErrorMessages.DOCKER_CREATION_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        DockerService.name,
      );
    } finally {
      SseService.sendEventToUsers(
        ['global-admin'],
        this.dockerSseConnection,
        { status: '', progress: 'docker.events.containerCreated' } as DockerEvent,
        SSE_MESSAGE_TYPE.MESSAGE,
      );
    }
  }

  async executeContainerCommand(params: { id: string; operation: TDockerCommands }) {
    const { id, operation } = params;
    try {
      SseService.sendEventToUsers(
        ['global-admin'],
        this.dockerSseConnection,
        { status: '', progress: `docker.events.${operation}Container` } as DockerEvent,
        SSE_MESSAGE_TYPE.MESSAGE,
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
}

export default DockerService;
