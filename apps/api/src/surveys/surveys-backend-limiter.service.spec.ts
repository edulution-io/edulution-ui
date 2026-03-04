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
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import CustomHttpException from '../common/CustomHttpException';
import SseService from '../sse/sse.service';
import { SurveysBackendLimiter } from './surveys-backend-limiter.schema';
import SurveysBackendLimiterService from './surveys-backend-limiter.service';
import {
  targetQuestionName,
  dropdownQuestionWithShowOtherItemName,
  dropdownQuestionWithoutShowOtherItemName,
  mockSurveyId,
  mockQuestionName,
  targetQuestion,
  otherQuestion,
  topLevelElements,
  panelElements,
  dynamicPanelElements,
  flatFormula,
  pagedFormula,
  surveyWithShowOtherItem,
  surveyWithoutShowOtherItem,
  surveyWithEmptyElements,
  mockChoices,
} from './mocks';

describe(SurveysBackendLimiterService.name, () => {
  let service: SurveysBackendLimiterService;
  let mockModel: Record<string, jest.Mock>;
  let mockSseService: { informAllUsers: jest.Mock };

  beforeEach(async () => {
    mockModel = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
    };

    mockSseService = {
      informAllUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysBackendLimiterService,
        { provide: getModelToken(SurveysBackendLimiter.name), useValue: mockModel },
        { provide: SseService, useValue: mockSseService },
      ],
    }).compile();

    service = module.get<SurveysBackendLimiterService>(SurveysBackendLimiterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getQuestionFromElementList', () => {
    it('should find a question at the top level', () => {
      const result = service.getQuestionFromElementList(topLevelElements, targetQuestionName);
      expect(result).toEqual(targetQuestion);
    });

    it('should find a question nested inside a panel', () => {
      const result = service.getQuestionFromElementList(panelElements, targetQuestionName);
      expect(result).toEqual(targetQuestion);
    });

    it('should find a question nested inside a dynamic panel', () => {
      const result = service.getQuestionFromElementList(dynamicPanelElements, targetQuestionName);
      expect(result).toEqual(targetQuestion);
    });

    it('should return undefined when question does not exist', () => {
      const result = service.getQuestionFromElementList([otherQuestion], 'nonExistent');
      expect(result).toBeUndefined();
    });
  });

  describe('getQuestionFromFormula', () => {
    it('should find a question when formula uses elements (flat structure)', () => {
      const result = service.getQuestionFromFormula(flatFormula, targetQuestionName);
      expect(result).toEqual(targetQuestion);
    });

    it('should find a question when formula uses pages', () => {
      const result = service.getQuestionFromFormula(pagedFormula, targetQuestionName);
      expect(result).toEqual(targetQuestion);
    });

    it('should return undefined when question does not exist', () => {
      const result = service.getQuestionFromFormula(pagedFormula, 'nonExistent');
      expect(result).toBeUndefined();
    });
  });

  describe('canAddOwnChoicesToTheQuestion', () => {
    it('should return true when question has showOtherItem enabled', () => {
      expect(
        service.canAddOwnChoicesToTheQuestion(surveyWithShowOtherItem, dropdownQuestionWithShowOtherItemName),
      ).toBe(true);
    });

    it('should return false when question has no showOtherItem', () => {
      expect(
        service.canAddOwnChoicesToTheQuestion(surveyWithoutShowOtherItem, dropdownQuestionWithoutShowOtherItemName),
      ).toBe(false);
    });

    it('should return false when question does not exist', () => {
      expect(service.canAddOwnChoicesToTheQuestion(surveyWithEmptyElements, 'nonExistent')).toBe(false);
    });
  });

  describe('throwErrorIfUserIsNotAllowedToAppendBackendLimiters', () => {
    it('should throw FORBIDDEN when question does not allow custom choices', () => {
      expect(() =>
        service.throwErrorIfAppendingOwnChoicesIsNotAllowed(
          surveyWithoutShowOtherItem,
          dropdownQuestionWithShowOtherItemName,
        ),
      ).toThrow(CustomHttpException);

      try {
        service.throwErrorIfAppendingOwnChoicesIsNotAllowed(
          surveyWithoutShowOtherItem,
          dropdownQuestionWithoutShowOtherItemName,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect((e as CustomHttpException).getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should not throw when question allows custom choices', () => {
      expect(() =>
        service.throwErrorIfAppendingOwnChoicesIsNotAllowed(
          surveyWithShowOtherItem,
          dropdownQuestionWithShowOtherItemName,
        ),
      ).not.toThrow();
    });
  });

  describe('updateOrCreateSurveysBackendLimiters', () => {
    it('should call findOneAndUpdate with correct parameters', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ surveyId: mockSurveyId, questionName: mockQuestionName, choices: mockChoices }),
      });

      await service.updateOrCreateSurveysBackendLimiters(mockSurveyId, mockQuestionName, mockChoices);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { surveyId: new Types.ObjectId(mockSurveyId), questionName: mockQuestionName },
        { choices: mockChoices },
        { new: true, upsert: true },
      );
    });

    it('should throw INTERNAL_SERVER_ERROR when result is null', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      try {
        await service.updateOrCreateSurveysBackendLimiters(mockSurveyId, mockQuestionName, mockChoices);
        fail('Expected CustomHttpException to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect((e as CustomHttpException).getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deleteBackendLimiter', () => {
    it('should call deleteOne with correct parameters', async () => {
      mockModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await service.deleteBackendLimiter(mockSurveyId, mockQuestionName);

      expect(mockModel.deleteOne).toHaveBeenCalledWith({
        surveyId: new Types.ObjectId(mockSurveyId),
        questionName: mockQuestionName,
      });
    });

    it('should throw NOT_MODIFIED on error', async () => {
      mockModel.deleteOne.mockRejectedValue(new Error('DB error'));

      try {
        await service.deleteBackendLimiter(mockSurveyId, mockQuestionName);
        fail('Expected CustomHttpException to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect((e as CustomHttpException).getStatus()).toBe(HttpStatus.NOT_MODIFIED);
      }
    });
  });

  describe('onSurveyRemoval', () => {
    it('should call deleteMany with ObjectId array', async () => {
      const id1 = new Types.ObjectId().toString();
      const id2 = new Types.ObjectId().toString();
      mockModel.deleteMany.mockResolvedValue({ deletedCount: 2 });

      await service.onSurveyRemoval([id1, id2]);

      expect(mockModel.deleteMany).toHaveBeenCalledWith({
        surveyId: { $in: [new Types.ObjectId(id1), new Types.ObjectId(id2)] },
      });
    });

    it('should throw NOT_MODIFIED on error', async () => {
      const id = new Types.ObjectId().toString();
      mockModel.deleteMany.mockRejectedValue(new Error('DB error'));

      try {
        await service.onSurveyRemoval([id]);
        fail('Expected CustomHttpException to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect((e as CustomHttpException).getStatus()).toBe(HttpStatus.NOT_MODIFIED);
      }
    });
  });
});
