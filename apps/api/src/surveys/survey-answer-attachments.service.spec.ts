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

import { join } from 'path';
import { Request, Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import TSurveyAnswer from '@libs/survey/types/TSurveyAnswer';
import TSurveyQuestionAnswerTypes from '@libs/survey/types/TSurveyQuestionAnswerTypes';
import TSurveyFileQuestionAnswerType from '@libs/survey/types/TSurveyFileQuestionAnswerType';
import SURVEY_ANSWERS_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersAttachmentPath';
import SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersTemporaryAttachmentPath';
import SURVEYS_ANSWER_FOLDER from '@libs/survey/constants/surveyAnswersFolder';
import ATTACHMENT_FOLDER from '@libs/common/constants/attachmentFolder';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import CustomHttpException from 'apps/api/src/common/CustomHttpException';
import SurveyAnswerAttachmentsService from './survey-answer-attachments.service';
import FilesystemService from '../filesystem/filesystem.service';
import mockFilesystemService from '../filesystem/filesystem.service.mock';

const mockServeTempFile = jest.fn();
const mockServeFile = jest.fn();
const mockDeleteFolderAndParentsUpToDepth = jest.fn().mockResolvedValue(undefined);

const extendedMockFilesystemService = {
  ...mockFilesystemService,
  serveTempFile: mockServeTempFile,
  serveFile: mockServeFile,
  deleteFolderAndParentsUpToDepth: mockDeleteFolderAndParentsUpToDepth,
};

describe('SurveyAnswerAttachmentsService', () => {
  let service: SurveyAnswerAttachmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyAnswerAttachmentsService,
        { provide: FilesystemService, useValue: extendedMockFilesystemService },
      ],
    }).compile();

    service = module.get<SurveyAnswerAttachmentsService>(SurveyAnswerAttachmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFileNamesFromFileQuestionAnswer', () => {
    it('should extract the filename from a single file answer', () => {
      const answer = { content: '/some/path/to/file.pdf' } as TSurveyFileQuestionAnswerType;

      const result = SurveyAnswerAttachmentsService.getFileNamesFromFileQuestionAnswer(
        answer as unknown as TSurveyQuestionAnswerTypes,
      );

      expect(result).toEqual(['file.pdf']);
    });

    it('should extract filenames from an array of file answers', () => {
      const answer = [{ content: '/path/a.pdf' }, { content: '/path/b.pdf' }] as TSurveyFileQuestionAnswerType[];

      const result = SurveyAnswerAttachmentsService.getFileNamesFromFileQuestionAnswer(
        answer as unknown as TSurveyQuestionAnswerTypes,
      );

      expect(result).toEqual(['a.pdf', 'b.pdf']);
    });

    it('should skip items that have no content property', () => {
      const answer = [{ content: '/path/a.pdf' }, {}] as TSurveyFileQuestionAnswerType[];

      const result = SurveyAnswerAttachmentsService.getFileNamesFromFileQuestionAnswer(
        answer as unknown as TSurveyQuestionAnswerTypes,
      );

      expect(result).toEqual(['a.pdf']);
    });

    it('should return an empty array for a plain string answer', () => {
      const result = SurveyAnswerAttachmentsService.getFileNamesFromFileQuestionAnswer(
        'some-text' as TSurveyQuestionAnswerTypes,
      );

      expect(result).toEqual([]);
    });
  });

  describe('removeDeprecatedFiles', () => {
    beforeEach(() => {
      jest.spyOn(FilesystemService, 'deleteFile').mockResolvedValue(undefined);
    });

    it('should delete files that are not in the keep list', async () => {
      await SurveyAnswerAttachmentsService.removeDeprecatedFiles('/dir', ['a.pdf', 'b.pdf', 'c.pdf'], ['a.pdf']);

      expect(FilesystemService.deleteFile).toHaveBeenCalledTimes(2);
      expect(FilesystemService.deleteFile).toHaveBeenCalledWith('/dir', 'b.pdf');
      expect(FilesystemService.deleteFile).toHaveBeenCalledWith('/dir', 'c.pdf');
    });

    it('should delete all files when no keep list is provided', async () => {
      await SurveyAnswerAttachmentsService.removeDeprecatedFiles('/dir', ['a.pdf', 'b.pdf']);

      expect(FilesystemService.deleteFile).toHaveBeenCalledTimes(2);
    });

    it('should not delete any files when all are in the keep list', async () => {
      await SurveyAnswerAttachmentsService.removeDeprecatedFiles('/dir', ['a.pdf', 'b.pdf'], ['a.pdf', 'b.pdf']);

      expect(FilesystemService.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('deleteTempQuestionAnswerFile', () => {
    it('should call checkIfFileExistAndDelete with the correct temp file path', async () => {
      jest.spyOn(FilesystemService, 'checkIfFileExistAndDelete').mockResolvedValue(undefined);

      await SurveyAnswerAttachmentsService.deleteTempQuestionAnswerFile('user', 'survey1', 'q1', 'file.pdf');

      const expectedPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, 'user', 'survey1', 'q1', 'file.pdf');
      expect(FilesystemService.checkIfFileExistAndDelete).toHaveBeenCalledWith(expectedPath);
    });
  });

  describe('deleteTempQuestionAnswerFiles', () => {
    it('should call deleteDirectory with the correct temp question path', async () => {
      await service.deleteTempQuestionAnswerFiles('user', 'survey1', 'q1');

      const expectedPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, 'user', 'survey1', 'q1');
      expect(extendedMockFilesystemService.deleteDirectory).toHaveBeenCalledWith(expectedPath);
    });
  });

  describe('serveFileFromAnswer', () => {
    const mockReq = {} as Request;
    const mockRes = {} as Response;

    beforeEach(() => {
      jest.spyOn(FilesystemService, 'checkIfFileExist').mockResolvedValue(false);
    });

    it('should serve from the temp directory when the temp file exists', async () => {
      jest.spyOn(FilesystemService, 'checkIfFileExist').mockResolvedValueOnce(true);
      mockServeTempFile.mockResolvedValue(mockRes);

      const result = await service.serveFileFromAnswer('user', 'survey1', 'q1', 'file.pdf', mockReq, mockRes);

      const expectedPath = join(SURVEYS_ANSWER_FOLDER, 'user', 'survey1', 'q1');
      expect(extendedMockFilesystemService.serveTempFile).toHaveBeenCalledWith(
        expectedPath,
        'file.pdf',
        mockReq,
        mockRes,
      );
      expect(result).toBe(mockRes);
    });

    it('should serve from the permanent directory when only the permanent file exists', async () => {
      jest.spyOn(FilesystemService, 'checkIfFileExist').mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      mockServeFile.mockResolvedValue(mockRes);

      const result = await service.serveFileFromAnswer('user', 'survey1', 'q1', 'file.pdf', mockReq, mockRes);

      const expectedPath = join(SURVEYS_ANSWER_FOLDER, ATTACHMENT_FOLDER, 'survey1', 'q1', 'user');
      expect(extendedMockFilesystemService.serveFile).toHaveBeenCalledWith(expectedPath, 'file.pdf', mockReq, mockRes);
      expect(result).toBe(mockRes);
    });

    it('should throw a NOT_FOUND exception when neither file exists', async () => {
      jest.spyOn(FilesystemService, 'checkIfFileExist').mockResolvedValue(false);

      await expect(service.serveFileFromAnswer('user', 'survey1', 'q1', 'file.pdf', mockReq, mockRes)).rejects.toThrow(
        new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('updateSurveyAnswerAttachments', () => {
    const tempDir = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, 'user', 'survey1', 'q1');
    const permanentDir = join(SURVEY_ANSWERS_ATTACHMENT_PATH, 'survey1', 'q1', 'user');

    beforeEach(() => {
      jest.spyOn(FilesystemService, 'moveFiles').mockResolvedValue(undefined);
      jest.spyOn(FilesystemService, 'deleteFile').mockResolvedValue(undefined);
    });

    it('should move files that are in the temp directory to the permanent directory', async () => {
      extendedMockFilesystemService.getAllFilenamesInDirectory
        .mockResolvedValueOnce(['new.pdf'])
        .mockResolvedValueOnce([]);

      await service.updateSurveyAnswerAttachments(['new.pdf'], tempDir, permanentDir);

      expect(FilesystemService.moveFiles).toHaveBeenCalledWith(['new.pdf'], tempDir, permanentDir);
    });

    it('should delete deprecated permanent files that are not referenced in the new answer', async () => {
      extendedMockFilesystemService.getAllFilenamesInDirectory
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(['kept.pdf', 'old.pdf']);

      await service.updateSurveyAnswerAttachments(['kept.pdf'], tempDir, permanentDir);

      expect(FilesystemService.deleteFile).toHaveBeenCalledWith(permanentDir, 'old.pdf');
      expect(FilesystemService.deleteFile).not.toHaveBeenCalledWith(permanentDir, 'kept.pdf');
    });

    it('should not delete any permanent files when keepOldFiles is true', async () => {
      extendedMockFilesystemService.getAllFilenamesInDirectory
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(['old.pdf']);

      await service.updateSurveyAnswerAttachments(['kept.pdf'], tempDir, permanentDir, true);

      expect(FilesystemService.deleteFile).not.toHaveBeenCalled();
    });

    it('should clean up the temp directory after processing', async () => {
      extendedMockFilesystemService.getAllFilenamesInDirectory.mockResolvedValue([]);

      await service.updateSurveyAnswerAttachments([], tempDir, permanentDir);

      expect(extendedMockFilesystemService.deleteFolderAndParentsUpToDepth).toHaveBeenCalledWith(tempDir, 3);
    });
  });

  describe('processFileQuestionAnswer', () => {
    beforeEach(() => {
      jest.spyOn(FilesystemService, 'ensureDirectoryExists').mockResolvedValue(undefined);
      jest.spyOn(service, 'updateSurveyAnswerAttachments').mockResolvedValue(undefined);
    });

    it('should wrap a single file answer in an array', async () => {
      const answer = { content: '/path/file.pdf' } as TSurveyFileQuestionAnswerType;

      const result = await service.processFileQuestionAnswer(
        'user',
        'survey1',
        'q1',
        answer as unknown as TSurveyQuestionAnswerTypes,
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([answer]);
    });

    it('should return the array unchanged when the answer is already an array', async () => {
      const answer = [{ content: '/path/a.pdf' }, { content: '/path/b.pdf' }] as TSurveyFileQuestionAnswerType[];

      const result = await service.processFileQuestionAnswer(
        'user',
        'survey1',
        'q1',
        answer as unknown as TSurveyQuestionAnswerTypes,
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(answer);
    });
  });

  describe('processQuestionAnswer', () => {
    describe('simple answers', () => {
      it('should return a string answer unchanged', async () => {
        const result = await service.processQuestionAnswer('user', 'survey1', 'q1', 'yes');

        expect(result).toBe('yes');
      });

      it('should return a number answer unchanged', async () => {
        const result = await service.processQuestionAnswer(
          'user',
          'survey1',
          'q1',
          42 as unknown as TSurveyQuestionAnswerTypes,
        );

        expect(result).toBe(42);
      });

      it('should return a boolean answer unchanged', async () => {
        const result = await service.processQuestionAnswer(
          'user',
          'survey1',
          'q1',
          true as unknown as TSurveyQuestionAnswerTypes,
        );

        expect(result).toBe(true);
      });

      it('should return an array of strings unchanged', async () => {
        const answer = ['option1', 'option2'] as unknown as TSurveyQuestionAnswerTypes;

        const result = await service.processQuestionAnswer('user', 'survey1', 'q1', answer);

        expect(result).toEqual(['option1', 'option2']);
      });
    });

    describe('file answers', () => {
      beforeEach(() => {
        jest.spyOn(FilesystemService, 'ensureDirectoryExists').mockResolvedValue(undefined);
        jest.spyOn(service, 'updateSurveyAnswerAttachments').mockResolvedValue(undefined);
      });

      it('should delegate a single file answer to processFileQuestionAnswer', async () => {
        const answer = { content: '/path/file.pdf' } as TSurveyFileQuestionAnswerType;
        jest.spyOn(service, 'processFileQuestionAnswer');

        await service.processQuestionAnswer('user', 'survey1', 'q1', answer as unknown as TSurveyQuestionAnswerTypes);

        expect(service.processFileQuestionAnswer).toHaveBeenCalled();
      });

      it('should delegate an array of file answers to processFileQuestionAnswer', async () => {
        const answer = [{ content: '/path/a.pdf' }] as TSurveyFileQuestionAnswerType[];
        jest.spyOn(service, 'processFileQuestionAnswer');

        await service.processQuestionAnswer('user', 'survey1', 'q1', answer as unknown as TSurveyQuestionAnswerTypes);

        expect(service.processFileQuestionAnswer).toHaveBeenCalled();
      });
    });

    describe('multipletext nested string values', () => {
      it('should return the object with unchanged string values, not a character-indexed object', async () => {
        const answer = { '0': 'some multiline text' } as unknown as TSurveyQuestionAnswerTypes;

        const result = await service.processQuestionAnswer('user', 'surveyId', 'questionId', answer);

        expect(result).toEqual({ '0': 'some multiline text' });
      });

      it('should preserve all keys and their full string values when multiple rows are present', async () => {
        const answer = { row1: 'first answer', row2: 'second answer' } as unknown as TSurveyQuestionAnswerTypes;

        const result = await service.processQuestionAnswer('user', 'surveyId', 'questionId', answer);

        expect(result).toEqual({ row1: 'first answer', row2: 'second answer' });
      });
    });

    describe('panel question answers', () => {
      it('should preserve the nested object structure of a panel question', async () => {
        const answer = {
          panelSubQ1: 'value1',
          panelSubQ2: 'value2',
        } as unknown as TSurveyQuestionAnswerTypes;

        const result = await service.processQuestionAnswer('user', 'survey1', 'panelQ', answer);

        expect(result).toEqual({ panelSubQ1: 'value1', panelSubQ2: 'value2' });
        expect(Array.isArray(result)).toBe(false);
      });

      it('should recursively preserve deeply nested panel sub-question string values', async () => {
        const answer = {
          address: { street: 'Main St', city: 'Springfield' },
        } as unknown as TSurveyQuestionAnswerTypes;

        const result = await service.processQuestionAnswer('user', 'survey1', 'panelQ', answer);

        expect(result).toEqual({ address: { street: 'Main St', city: 'Springfield' } });
      });
    });

    describe('dynamic panel question answers', () => {
      it('should preserve the array of panel instances', async () => {
        const answer = [
          { subQ1: 'row1 answer', subQ2: 'row1 other' },
          { subQ1: 'row2 answer', subQ2: 'row2 other' },
        ] as unknown as TSurveyQuestionAnswerTypes;

        const result = await service.processQuestionAnswer('user', 'survey1', 'dynamicPanelQ', answer);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual([
          { subQ1: 'row1 answer', subQ2: 'row1 other' },
          { subQ1: 'row2 answer', subQ2: 'row2 other' },
        ]);
      });

      it('should preserve each panel instance as an object, not collapse it into a flat array', async () => {
        const answer = [{ subQ1: 'only row' }] as unknown as TSurveyQuestionAnswerTypes;

        const result = await service.processQuestionAnswer('user', 'survey1', 'dynamicPanelQ', answer);

        expect(Array.isArray(result)).toBe(true);
        expect((result as unknown[])[0]).toEqual({ subQ1: 'only row' });
      });
    });

    describe('shape preservation', () => {
      it('should return an array when the input is an array of primitives', async () => {
        const answer = ['option1', 'option2'] as unknown as TSurveyQuestionAnswerTypes;

        const result = await service.processQuestionAnswer('user', 'surveyId', 'questionId', answer);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual(['option1', 'option2']);
      });

      it('should return an object when the input is an object with numeric-string keys', async () => {
        const answer = { '0': 'a', '1': 'b' } as unknown as TSurveyQuestionAnswerTypes;

        const result = await service.processQuestionAnswer('user', 'surveyId', 'questionId', answer);

        expect(Array.isArray(result)).toBe(false);
        expect(result).toEqual({ '0': 'a', '1': 'b' });
      });
    });
  });

  describe('processSurveyAnswer', () => {
    it('should process all question answers and return a complete answer object', async () => {
      jest
        .spyOn(service, 'processQuestionAnswer')
        .mockImplementation((_user, _survey, _questionId, questionAnswer) => Promise.resolve(questionAnswer));

      const answer: TSurveyAnswer = { q1: 'yes', q2: 'no' };

      const result = await service.processSurveyAnswer('user', 'survey1', answer);

      expect(result).toEqual({ q1: 'yes', q2: 'no' });
      expect(service.processQuestionAnswer).toHaveBeenCalledTimes(2);
      expect(service.processQuestionAnswer).toHaveBeenCalledWith('user', 'survey1', 'q1', 'yes', false);
      expect(service.processQuestionAnswer).toHaveBeenCalledWith('user', 'survey1', 'q2', 'no', false);
    });

    it('should forward the keepOldFiles flag to each processQuestionAnswer call', async () => {
      jest
        .spyOn(service, 'processQuestionAnswer')
        .mockImplementation((_user, _survey, _questionId, questionAnswer) => Promise.resolve(questionAnswer));

      await service.processSurveyAnswer('user', 'survey1', { q1: 'yes' }, true);

      expect(service.processQuestionAnswer).toHaveBeenCalledWith('user', 'survey1', 'q1', 'yes', true);
    });
  });

  describe('clearUpSurveyAnswersTempFiles', () => {
    it('should delete the survey-level temp folder and then the user-level temp folder', async () => {
      await service.clearUpSurveyAnswersTempFiles('user', 'survey1');

      const expectedSurveyPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, 'user', 'survey1');
      const expectedUserPath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, 'user');

      expect(extendedMockFilesystemService.deleteEmptyFolder).toHaveBeenCalledTimes(2);
      expect(extendedMockFilesystemService.deleteEmptyFolder).toHaveBeenNthCalledWith(1, expectedSurveyPath);
      expect(extendedMockFilesystemService.deleteEmptyFolder).toHaveBeenNthCalledWith(2, expectedUserPath);
    });
  });
});
