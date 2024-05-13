/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ConferencesService from './conferences.service';
import { Conference, ConferenceDocument } from './conference.schema';
import CreateConferenceDto from './dto/create-conference.dto';

const mockConference: CreateConferenceDto = {
  name: 'Testmeeting',
  attendees: [],
};

const conferencesModelMock = {
  create: jest.fn().mockResolvedValue(mockConference),

  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockConference]),
  }),
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockConference),
  }),
  findOneAndUpdate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockConference),
  }),
  deleteOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(true),
  }),
};

describe(ConferencesService.name, () => {
  let service: ConferencesService;
  let model: Model<ConferenceDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConferencesService,
        {
          provide: getModelToken(Conference.name),
          useValue: conferencesModelMock,
        },
      ],
    }).compile();

    service = module.get<ConferencesService>(ConferencesService);
    model = module.get<Model<ConferenceDocument>>(getModelToken(Conference.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a meeting', async () => {
      const createDto: CreateConferenceDto = { ...mockConference };
      const result = await service.create(createDto, 'creator');
      expect(model.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of meetings', async () => {
      const result = await service.findAll('creator');
      expect(result).toEqual([mockConference]);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should retrieve a single meeting by ID', async () => {
      const result = await service.findOne(mockConference.name);
      expect(result).toEqual(mockConference);
      expect(model.findOne).toHaveBeenCalledWith({ meetingID: mockConference.name });
    });
  });

  describe('update', () => {
    it('should update a meeting', async () => {
      const mock = new Conference(mockConference, 'creator');
      const result = await service.update(mock);
      expect(result).toEqual(mockConference);
      expect(model.findOneAndUpdate).toHaveBeenCalledWith({ meetingID: mockConference.name }, mock, {
        new: true,
      });
    });
  });

  describe('remove', () => {
    it('should remove a meeting', async () => {
      const result = await service.remove(['1']);
      expect(result).toBeTruthy();
      expect(model.deleteOne).toHaveBeenCalled();
    });
  });
});
