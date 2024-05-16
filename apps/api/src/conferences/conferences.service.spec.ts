/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ConferencesService from './conferences.service';
import { Conference, ConferenceDocument } from './conference.schema';
import CreateConferenceDto from './dto/create-conference.dto';
import { Attendee } from './dto/attendee';
import JWTUser from '../types/JWTUser';

const mockConference: CreateConferenceDto = {
  name: 'Testconference',
  invitedAttendees: [],
};

const mockCreator: Attendee = {
  username: 'username',
  lastName: 'lastName',
  firstName: 'firstName',
};

const mockJWTUser: JWTUser = {
  preferred_username: 'username',
  given_name: 'firstName',
  family_name: 'lastName',
} as JWTUser;

const mockConferenceDocument: ConferenceDocument = {
  name: mockConference.name,
  invitedAttendees: [],
  creator: mockCreator,
  meetingID: 'mockMeetingId',
  isRunning: false,
  joinedAttendees: [mockCreator],
  toObject: jest.fn().mockImplementation(() => mockConferenceDocument),
} as unknown as ConferenceDocument;

const conferencesModelMock = {
  create: jest.fn().mockResolvedValue(mockConferenceDocument),

  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockConferenceDocument]),
  }),
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockConferenceDocument),
  }),
  findOneAndUpdate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockConferenceDocument),
  }),
  deleteMany: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
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
    it('should create and save a conference', async () => {
      const createDto: CreateConferenceDto = { ...mockConference };
      const result = await service.create(createDto, mockJWTUser);
      expect(model.create).toHaveBeenCalled();
      expect(result.creator).toEqual(mockCreator);
    });
  });

  describe('findAll', () => {
    it('should return an array of conferences', async () => {
      const result = await service.findAll(mockCreator.username);
      expect(result[0].creator).toEqual(mockCreator);
      expect(model.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should retrieve a single conference by ID', async () => {
      const result = await service.findOne(mockConference.name);
      expect(result?.creator).toEqual(mockCreator);
      expect(model.findOne).toHaveBeenCalledWith({ meetingID: mockConference.name });
    });
  });

  describe('update', () => {
    it('should update a conference', async () => {
      const mock = new Conference(mockConference, mockCreator);
      const result = await service.update(mock, mockCreator.username);
      expect(result?.creator).toEqual(mockCreator);
      expect(model.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a conference', async () => {
      const result = await service.remove(['1'], mockCreator.username);
      expect(result).toBeTruthy();
      expect(model.deleteMany).toHaveBeenCalled();
    });
  });
});
