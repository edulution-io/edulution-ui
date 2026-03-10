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

import { Test, TestingModule } from '@nestjs/testing';
import DOCKER_COMMANDS from '@libs/docker/constants/dockerCommands';
import DockerController from './docker.controller';
import DockerService from './docker.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

describe(DockerController.name, () => {
  let controller: DockerController;
  let dockerService: Record<string, jest.Mock>;

  beforeEach(async () => {
    dockerService = {
      getContainers: jest.fn().mockResolvedValue([]),
      createContainer: jest.fn().mockResolvedValue(undefined),
      executeContainerCommand: jest.fn().mockResolvedValue(undefined),
      deleteContainer: jest.fn().mockResolvedValue(undefined),
      updateContainer: jest.fn().mockResolvedValue({ id: 'c-1', isImageUpdated: true }),
      updateEduManagerAgentContainer: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DockerController],
      providers: [
        { provide: DockerService, useValue: dockerService },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    controller = module.get<DockerController>(DockerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getContainers', () => {
    it('should delegate to dockerService.getContainers', async () => {
      await controller.getContainers();
      expect(dockerService.getContainers).toHaveBeenCalledWith(undefined);
    });

    it('should pass applicationNames query parameter', async () => {
      await controller.getContainers('nginx');
      expect(dockerService.getContainers).toHaveBeenCalledWith('nginx');
    });
  });

  describe('createContainer', () => {
    it('should delegate to dockerService.createContainer', async () => {
      const dto = { applicationName: 'app', containers: [], originalComposeConfig: '' };
      await controller.createContainer(dto as never);
      expect(dockerService.createContainer).toHaveBeenCalledWith(dto);
    });
  });

  describe('executeContainerCommand', () => {
    it('should delegate to dockerService.executeContainerCommand', async () => {
      const params = { id: 'container-1', operation: DOCKER_COMMANDS.START as string };
      await controller.executeContainerCommand(params as never);
      expect(dockerService.executeContainerCommand).toHaveBeenCalledWith(params);
    });
  });

  describe('deleteContainer', () => {
    it('should delegate to dockerService.deleteContainer', async () => {
      await controller.deleteContainer('container-1');
      expect(dockerService.deleteContainer).toHaveBeenCalledWith('container-1');
    });
  });

  describe('updateContainer', () => {
    it('should delegate to dockerService.updateContainer', async () => {
      const result = await controller.updateContainer('container-1');
      expect(dockerService.updateContainer).toHaveBeenCalledWith('container-1');
      expect(result).toEqual({ id: 'c-1', isImageUpdated: true });
    });
  });

  describe('updateEduManagerAgentContainer', () => {
    it('should delegate to dockerService.updateEduManagerAgentContainer', async () => {
      const req = { ip: '172.17.0.2' };
      await controller.updateEduManagerAgentContainer(req as never);
      expect(dockerService.updateEduManagerAgentContainer).toHaveBeenCalledWith(req);
    });
  });
});
