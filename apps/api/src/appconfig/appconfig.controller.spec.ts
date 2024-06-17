import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import AppConfigController from './appconfig.controller';
import AppConfigService from './appconfig.service';
import { AppConfig } from './appconfig.schema';

const mockAppConfigModel = {
  insertMany: jest.fn(),
  bulkWrite: jest.fn(),
  find: jest.fn(),
  deleteOne: jest.fn(),
};

describe('AppConfigController', () => {
  let controller: AppConfigController;
  let service: AppConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppConfigController],
      providers: [
        AppConfigService,
        {
          provide: getModelToken(AppConfig.name),
          useValue: mockAppConfigModel,
        },
      ],
    }).compile();

    controller = module.get<AppConfigController>(AppConfigController);
    service = module.get<AppConfigService>(AppConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
