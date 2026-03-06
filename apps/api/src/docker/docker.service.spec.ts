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

import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import DOCKER_COMMANDS from '@libs/docker/constants/dockerCommands';
import DockerErrorMessages from '@libs/docker/constants/dockerErrorMessages';
import DOCKER_PROTECTED_CONTAINERS from '@libs/docker/constants/dockerProtectedContainer';
import DockerService from './docker.service';
import SseService from '../sse/sse.service';
import AppConfigService from '../appconfig/appconfig.service';
import CustomHttpException from '../common/CustomHttpException';

const mockContainer = {
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  restart: jest.fn().mockResolvedValue(undefined),
  kill: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  inspect: jest.fn().mockResolvedValue({
    Config: { Image: 'nginx:latest' },
    HostConfig: {},
    NetworkSettings: { Networks: {} },
    Name: '/test-container',
  }),
  stats: jest.fn().mockResolvedValue({
    cpu_stats: { cpu_usage: { total_usage: 200 }, system_cpu_usage: 1000, online_cpus: 2 },
    precpu_stats: { cpu_usage: { total_usage: 100 }, system_cpu_usage: 500 },
    memory_stats: { usage: 104857600, limit: 1073741824 },
  }),
  id: 'container-123',
};

const mockDocker = {
  listContainers: jest.fn().mockResolvedValue([]),
  getContainer: jest.fn().mockReturnValue(mockContainer),
  createContainer: jest.fn().mockResolvedValue(mockContainer),
  pull: jest.fn(),
  getEvents: jest.fn(),
  modem: {
    followProgress: jest.fn(),
  },
};

jest.mock('dockerode', () => jest.fn().mockImplementation(() => mockDocker));

describe(DockerService.name, () => {
  let service: DockerService;
  let sseService: Record<string, jest.Mock>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockDocker.getEvents.mockImplementation((_cb: unknown) => {});

    sseService = {
      sendEventToUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DockerService,
        { provide: SseService, useValue: sseService },
        { provide: AppConfigService, useValue: { getAppConfigByName: jest.fn().mockResolvedValue(null) } },
      ],
    }).compile();

    service = module.get<DockerService>(DockerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getContainers', () => {
    it('should return list of containers', async () => {
      const containers = [{ Id: 'abc123', Names: ['/nginx'], State: 'running' }];
      mockDocker.listContainers.mockResolvedValue(containers);

      const result = await service.getContainers();

      expect(result).toEqual(containers);
      expect(mockDocker.listContainers).toHaveBeenCalledWith({ all: true, filters: {} });
    });

    it('should filter containers by application names', async () => {
      mockDocker.listContainers.mockResolvedValue([]);

      await service.getContainers('nginx');

      expect(mockDocker.listContainers).toHaveBeenCalledWith({
        all: true,
        filters: { name: ['/nginx'] },
      });
    });

    it('should accept array of application names', async () => {
      mockDocker.listContainers.mockResolvedValue([]);

      await service.getContainers(['nginx', 'redis']);

      expect(mockDocker.listContainers).toHaveBeenCalledWith({
        all: true,
        filters: { name: ['/nginx', '/redis'] },
      });
    });

    it('should throw INTERNAL_SERVER_ERROR when docker connection fails', async () => {
      mockDocker.listContainers.mockRejectedValue(new Error('ENOENT'));

      await expect(service.getContainers()).rejects.toMatchObject({
        message: DockerErrorMessages.DOCKER_CONNECTION_ERROR,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('executeContainerCommand', () => {
    it('should start a container', async () => {
      await service.executeContainerCommand({ id: 'test-id', operation: DOCKER_COMMANDS.START });

      expect(mockDocker.getContainer).toHaveBeenCalledWith('test-id');
      expect(mockContainer.start).toHaveBeenCalled();
    });

    it('should stop a container', async () => {
      await service.executeContainerCommand({ id: 'test-id', operation: DOCKER_COMMANDS.STOP });

      expect(mockContainer.stop).toHaveBeenCalled();
    });

    it('should restart a container', async () => {
      await service.executeContainerCommand({ id: 'test-id', operation: DOCKER_COMMANDS.RESTART });

      expect(mockContainer.restart).toHaveBeenCalled();
    });

    it('should kill a container', async () => {
      await service.executeContainerCommand({ id: 'test-id', operation: DOCKER_COMMANDS.KILL });

      expect(mockContainer.kill).toHaveBeenCalled();
    });

    it('should throw for unknown operation', async () => {
      await expect(
        service.executeContainerCommand({ id: 'test-id', operation: 'unknown' as never }),
      ).rejects.toMatchObject({
        message: DockerErrorMessages.DOCKER_COMMAND_EXECUTION_ERROR,
      });
    });

    it('should throw FORBIDDEN for protected containers', async () => {
      await expect(
        service.executeContainerCommand({
          id: DOCKER_PROTECTED_CONTAINERS.API,
          operation: DOCKER_COMMANDS.STOP,
        }),
      ).rejects.toMatchObject({
        message: DockerErrorMessages.DOCKER_COMMAND_EXECUTION_ERROR,
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('should throw when container operation fails', async () => {
      mockContainer.start.mockRejectedValueOnce(new Error('Container already started'));

      await expect(
        service.executeContainerCommand({ id: 'test-id', operation: DOCKER_COMMANDS.START }),
      ).rejects.toMatchObject({
        message: DockerErrorMessages.DOCKER_COMMAND_EXECUTION_ERROR,
      });
    });
  });

  describe('checkProtectedContainer', () => {
    it('should throw for protected container', () => {
      expect(() => DockerService.checkProtectedContainer(DOCKER_PROTECTED_CONTAINERS.KEYCLOAK)).toThrow(
        CustomHttpException,
      );
    });

    it('should not throw for non-protected container', () => {
      expect(() => DockerService.checkProtectedContainer('my-custom-container')).not.toThrow();
    });
  });

  describe('deleteContainer', () => {
    it('should remove container by id', async () => {
      await service.deleteContainer('test-id');

      expect(mockDocker.getContainer).toHaveBeenCalledWith('test-id');
      expect(mockContainer.remove).toHaveBeenCalled();
    });

    it('should throw for protected container', async () => {
      await expect(service.deleteContainer(DOCKER_PROTECTED_CONTAINERS.MONGODB)).rejects.toMatchObject({
        message: DockerErrorMessages.DOCKER_COMMAND_EXECUTION_ERROR,
        status: HttpStatus.FORBIDDEN,
      });
    });

    it('should throw INTERNAL_SERVER_ERROR when removal fails', async () => {
      mockContainer.remove.mockRejectedValueOnce(new Error('No such container'));

      await expect(service.deleteContainer('missing-id')).rejects.toMatchObject({
        message: DockerErrorMessages.DOCKER_CONTAINER_DELETION_ERROR,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('getContainerStats', () => {
    it('should return stats for all containers', async () => {
      mockDocker.listContainers.mockResolvedValue([{ Id: 'abc123456789', Names: ['/nginx'], Image: 'nginx:latest' }]);

      const result = await service.getContainerStats();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'abc123456789'.slice(0, 12),
          name: 'nginx',
          image: 'nginx:latest',
        }),
      );
      expect(typeof result[0].cpuPercent).toBe('number');
      expect(typeof result[0].memUsageMB).toBe('number');
    });

    it('should return error object when stats fail for a container', async () => {
      mockDocker.listContainers.mockResolvedValue([{ Id: 'abc123456789', Names: ['/broken'], Image: 'broken:latest' }]);
      mockContainer.stats.mockRejectedValueOnce(new Error('container not running'));

      const result = await service.getContainerStats();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'abc123456789'.slice(0, 12),
          error: 'container not running',
        }),
      );
    });
  });

  describe('updateContainer', () => {
    it('should pull image, stop, remove, recreate, and start container', async () => {
      const pullStream = {};
      mockDocker.pull.mockResolvedValue(pullStream);
      mockDocker.modem.followProgress.mockImplementation(
        (_stream: unknown, onFinish: (err: null, output: Array<{ status: string }>) => void) => {
          onFinish(null, [{ status: 'Downloaded newer image for nginx:latest' }]);
        },
      );

      const result = await service.updateContainer('container-123');

      expect(mockContainer.inspect).toHaveBeenCalled();
      expect(mockContainer.stop).toHaveBeenCalled();
      expect(mockContainer.remove).toHaveBeenCalled();
      expect(mockDocker.createContainer).toHaveBeenCalled();
      expect(mockContainer.start).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ isImageUpdated: true }));
    });

    it('should skip stop/remove/recreate when image is up to date', async () => {
      const pullStream = {};
      mockDocker.pull.mockResolvedValue(pullStream);
      mockDocker.modem.followProgress.mockImplementation(
        (_stream: unknown, onFinish: (err: null, output: Array<{ status: string }>) => void) => {
          onFinish(null, [{ status: 'Image is up to date for nginx:latest' }]);
        },
      );

      const result = await service.updateContainer('container-123');

      expect(mockContainer.stop).not.toHaveBeenCalled();
      expect(mockContainer.remove).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ isImageUpdated: false }));
    });

    it('should throw INTERNAL_SERVER_ERROR when update fails', async () => {
      mockContainer.inspect.mockRejectedValueOnce(new Error('inspect failed'));

      await expect(service.updateContainer('container-123')).rejects.toMatchObject({
        message: DockerErrorMessages.DOCKER_UPDATE_ERROR,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('createContainer', () => {
    it('should pull images, create containers, and start them', async () => {
      const pullStream = {};
      mockDocker.pull.mockResolvedValue(pullStream);
      mockDocker.modem.followProgress.mockImplementation(
        (_stream: unknown, onFinish: (err: null, output: Array<{ status: string }>) => void) => {
          onFinish(null, [{ status: 'Downloaded newer image for nginx:latest' }]);
        },
      );

      await service.createContainer({
        applicationName: 'test-app',
        containers: [{ Image: 'nginx:latest', name: 'test-nginx' }] as never,
        originalComposeConfig: '',
      });

      expect(mockDocker.pull).toHaveBeenCalledWith('nginx:latest');
      expect(mockDocker.createContainer).toHaveBeenCalled();
      expect(mockContainer.start).toHaveBeenCalled();
    });

    it('should throw INTERNAL_SERVER_ERROR when creation fails', async () => {
      mockDocker.pull.mockRejectedValue(new Error('Pull failed'));

      await expect(
        service.createContainer({
          applicationName: 'test-app',
          containers: [{ Image: 'bad:image', name: 'fail' }] as never,
          originalComposeConfig: '',
        }),
      ).rejects.toMatchObject({
        message: DockerErrorMessages.DOCKER_CREATION_ERROR,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('onModuleDestroy', () => {
    it('should be callable without error when no subscription exists', () => {
      expect(() => service.onModuleDestroy()).not.toThrow();
    });
  });
});
