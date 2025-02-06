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

// import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import SurveysService from './surveys.service';
import { Survey } from './survey.schema';
import { firstMockJWTUser, mockedSurveys } from './mocks';
import { surveyUpdateInitialSurveyDto } from './mocks/surveys/updated-survey';
import UserConnections from '../types/userConnections';
import cacheManagerMock from '../common/mocks/cacheManagerMock';

const mockSseConnections: UserConnections = new Map();

describe('SurveyService', () => {
  let service: SurveysService;
  // let surveyModel: Model<SurveyDocument>;

  beforeEach(async () => {
    Logger.error = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        SurveysService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
    // surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPublicSurvey', () => {
    // it('should search for public survey given an id', async () => {
    //   surveyModel.findOne = jest.fn().mockReturnValue({
    //     exec: jest.fn().mockReturnValue(publicSurvey01),
    //   });
    //
    //   const result = await service.findPublicSurvey(idOfPublicSurvey01.toString());
    //   expect(result).toEqual(publicSurvey01);
    //
    //   expect(surveyModel.findOne).toHaveBeenCalledWith({ id: idOfPublicSurvey01, isPublic: true });
    // });
    // it('should throw an error if the database access fails', async () => {
    //   surveyModel.findOne = jest.fn().mockReturnValue({
    //     exec: jest
    //       .fn()
    //       .mockRejectedValue(
    //         new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR),
    //       ),
    //   });
    //
    //   try {
    //     await service.findPublicSurvey(idOfPublicSurvey01.toString());
    //   } catch (e) {
    //     const error = e as Error;
    //     expect(error.message).toEqual(CommonErrorMessages.DBAccessFailed);
    //   }
    //   expect(surveyModel.findOne).toHaveBeenCalledWith({ id: idOfPublicSurvey01, isPublic: true });
    // });
  });

  describe('deleteSurveys', () => {
    // it('should delete a survey', async () => {
    //   surveyModel.deleteMany = jest.fn();
    //
    //   const surveyIds = [surveyUpdateSurveyId.toString()];
    //   await service.deleteSurveys(surveyIds, mockSseConnections);
    //   expect(surveyModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: surveyIds } });
    // });
    // it('should throw an error if the survey deletion fails', async () => {
    //   surveyModel.deleteMany = jest
    //     .fn()
    //     .mockRejectedValueOnce(new CustomHttpException(SurveyErrorMessages.DeleteError, HttpStatus.NOT_MODIFIED));
    //
    //   const surveyIds = [new Types.ObjectId().toString()];
    //   try {
    //     await service.deleteSurveys(surveyIds, mockSseConnections);
    //   } catch (e) {
    //     const error = e as Error;
    //     expect(error.message).toEqual(SurveyErrorMessages.DeleteError);
    //   }
    //   expect(surveyModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: surveyIds } });
    // });
  });

  describe('createSurvey', () => {
    // it('should create a survey', async () => {
    //   surveyModel.create = jest.fn().mockReturnValueOnce(surveyUpdateInitialSurveyDto);
    //
    //   await service
    //     .createSurvey(surveyUpdateInitialSurveyDto, firstMockJWTUser, mockSseConnections)
    //     .then((data) => expect(data).toStrictEqual(surveyUpdateInitialSurveyDto))
    //     .catch(() => {});
    //
    //   expect(surveyModel.create).toHaveBeenCalledWith(surveyUpdateInitialSurveyDto);
    // });
    // it('should throw an error if the survey creation fails', async () => {
    //   surveyModel.findOneAndUpdate = jest.fn().mockResolvedValue(null);
    //   surveyModel.create = jest
    //     .fn()
    //     .mockRejectedValueOnce(
    //       new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR),
    //     );
    //
    //   try {
    //     await service.createSurvey(surveyUpdateInitialSurveyDto, firstMockJWTUser, mockSseConnections);
    //   } catch (e) {
    //     const error = e as Error;
    //     expect(error.message).toEqual(CommonErrorMessages.DBAccessFailed);
    //   }
    //   expect(surveyModel.create).toHaveBeenCalledWith(surveyUpdateInitialSurveyDto);
    // });
  });

  describe('updateSurvey', () => {
    // it('should update a survey', async () => {
    //   surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //     exec: jest.fn().mockReturnValue(surveyUpdateInitialSurveyDto),
    //   });
    //   const result = await service.updateSurvey(surveyUpdateInitialSurveyDto, firstMockJWTUser, mockSseConnections);
    //
    //   expect(result).toStrictEqual(surveyUpdateInitialSurveyDto);
    //
    //   expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
    //     { id: surveyUpdateSurveyId },
    //     surveyUpdateInitialSurveyDto,
    //   );
    // });
    // it('should throw an error if the survey update fails', async () => {
    //   surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //     exec: jest
    //       .fn()
    //       .mockRejectedValue(
    //         new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR),
    //       ),
    //   });
    //   try {
    //     await service.updateSurvey(surveyUpdateInitialSurveyDto, firstMockJWTUser, mockSseConnections);
    //   } catch (e) {
    //     const error = e as Error;
    //     expect(error.message).toBe(CommonErrorMessages.DBAccessFailed);
    //   }
    // });
    // TODO: NIEDUUI-405: Survey: Update backendLimiters on question removal or name change of a question
  });

  describe('updateOrCreateSurvey', () => {
    // it('should create a survey if it does not exist', async () => {
    //   surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //     exec: jest.fn().mockReturnValue(null),
    //   });
    //   surveyModel.create = jest.fn().mockReturnValue(surveyUpdateInitialSurvey);
    //
    //   const result = await service.updateOrCreateSurvey(
    //     surveyUpdateInitialSurveyDto,
    //     firstMockJWTUser,
    //     mockSseConnections,
    //   );
    //   expect(result).toStrictEqual(surveyUpdateInitialSurvey);
    //
    //   expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
    //     { id: surveyUpdateSurveyId },
    //     surveyUpdateInitialSurveyDto,
    //   );
    //   expect(surveyModel.create).toHaveBeenCalledWith(surveyUpdateInitialSurveyDto);
    // });

    // it('should update a survey', async () => {
    //   surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //     exec: jest.fn().mockReturnValue(surveyUpdateUpdatedSurvey),
    //   });
    //
    //   const result = await service.updateOrCreateSurvey(
    //     surveyUpdateUpdatedSurveyDto,
    //     firstMockJWTUser,
    //     mockSseConnections,
    //   );
    //   expect(result).toStrictEqual(surveyUpdateUpdatedSurvey);
    //
    //   expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
    //     { id: surveyUpdateSurveyId },
    //     surveyUpdateUpdatedSurveyDto,
    //   );
    // });

    it('should create a survey if the update failed', async () => {
      jest.spyOn(service, 'updateSurvey').mockResolvedValue(null);
      jest.spyOn(service, 'createSurvey').mockResolvedValue(mockedSurveys[0]);

      const result = await service.updateOrCreateSurvey(
        surveyUpdateInitialSurveyDto,
        firstMockJWTUser,
        mockSseConnections,
      );
      expect(result).toBe(mockedSurveys[0]);
    });
  });
});
