import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import ConferencesService from './conferences.service';
import ConferencesController from './conferences.controller';
import { Conference } from './conference.schema';
import AppConfigService from '../appconfig/appconfig.service';
import mockAppConfigService from '../appconfig/appconfig.service.mock';

const mockConferencesModel = {
  insertMany: jest.fn(),
  bulkWrite: jest.fn(),
  find: jest.fn(),
  deleteOne: jest.fn(),
};

describe(ConferencesController.name, () => {
  let controller: ConferencesController;
  let service: ConferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConferencesController],
      providers: [
        ConferencesService,
        {
          provide: getModelToken(Conference.name),
          useValue: mockConferencesModel,
        },
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
      ],
    }).compile();

    controller = module.get<ConferencesController>(ConferencesController);
    service = module.get<ConferencesService>(ConferencesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});