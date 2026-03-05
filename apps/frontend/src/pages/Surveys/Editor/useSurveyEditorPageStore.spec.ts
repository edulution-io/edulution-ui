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

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));
vi.mock('i18next', () => ({ t: (key: string) => key }));
vi.mock('@libs/common/utils/convertImageFileToCompressedWebp', () => ({
  default: vi.fn((file: File) => Promise.resolve(file)),
}));

import { toast } from 'sonner';
import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import surveyHandlers from '@libs/test-utils/msw/handlers/surveyHandlers';
import eduApi from '@/api/eduApi';
import type SurveyDto from '@libs/survey/types/api/survey.dto';
import useSurveyEditorPageStore from './useSurveyEditorPageStore';

const createMockSurvey = (overrides: Partial<SurveyDto> = {}): SurveyDto => ({
  formula: { title: 'Test Survey', description: 'desc', pages: [], elements: [] },
  saveNo: 1,
  creator: { firstName: 'Max', lastName: 'Mustermann', username: 'max', label: 'Max', value: 'max' },
  invitedAttendees: [],
  invitedGroups: [],
  participatedAttendees: [],
  answers: [],
  expires: null,
  ...overrides,
});

describe('useSurveyEditorPageStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    server.use(...surveyHandlers);
    useSurveyEditorPageStore.getState().reset();
  });

  describe('updateOrCreateSurvey', () => {
    it('returns true and sets isLoading to false on success', async () => {
      const survey = createMockSurvey();

      const result = await useSurveyEditorPageStore.getState().updateOrCreateSurvey(survey);

      expect(result).toBe(true);
      expect(useSurveyEditorPageStore.getState().isLoading).toBe(false);
    });

    it('opens share dialog when survey is public', async () => {
      const survey = createMockSurvey({ isPublic: true });

      await useSurveyEditorPageStore.getState().updateOrCreateSurvey(survey);

      const state = useSurveyEditorPageStore.getState();
      expect(state.isOpenSharePublicSurveyDialog).toBe(true);
      expect(state.publicSurveyId).toBe('survey-abc-123');
    });

    it('does not open share dialog when survey is not public', async () => {
      const survey = createMockSurvey({ isPublic: false });

      await useSurveyEditorPageStore.getState().updateOrCreateSurvey(survey);

      const state = useSurveyEditorPageStore.getState();
      expect(state.isOpenSharePublicSurveyDialog).toBe(false);
    });

    it('returns false on error', async () => {
      server.use(
        http.post('/edu-api/surveys', () =>
          HttpResponse.json({ message: 'survey.create.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const survey = createMockSurvey();
      const result = await useSurveyEditorPageStore.getState().updateOrCreateSurvey(survey);

      expect(result).toBe(false);
      expect(useSurveyEditorPageStore.getState().isLoading).toBe(false);
    });
  });

  describe('uploadFile', () => {
    it('calls callback with success and file URL on success', async () => {
      const postSpy = vi.spyOn(eduApi, 'post').mockResolvedValueOnce({ data: 'uploads/survey-image.png' });

      const callback = vi.fn();
      const file = new File(['test'], 'image.png', { type: 'image/png' });

      await useSurveyEditorPageStore.getState().uploadFile(file, callback);

      expect(postSpy).toHaveBeenCalledWith(
        'surveys/files',
        expect.any(FormData),
        expect.objectContaining({ headers: expect.any(Object) }),
      );
      expect(callback).toHaveBeenCalledWith('success', expect.stringContaining('uploads/survey-image.png'));
      expect(toast.success).toHaveBeenCalledWith('survey.editor.fileUploadSuccess');
      expect(useSurveyEditorPageStore.getState().isUploadingFile).toBe(false);

      postSpy.mockRestore();
    });

    it('calls callback with error on failure', async () => {
      const postSpy = vi.spyOn(eduApi, 'post').mockRejectedValueOnce(new Error('upload failed'));

      const callback = vi.fn();
      const file = new File(['test'], 'image.png', { type: 'image/png' });

      await useSurveyEditorPageStore.getState().uploadFile(file, callback);

      expect(callback).toHaveBeenCalledWith('error');
      expect(useSurveyEditorPageStore.getState().isUploadingFile).toBe(false);

      postSpy.mockRestore();
    });
  });

  describe('state setters', () => {
    it('setIsOpenSurveysLogoDialog updates state', () => {
      useSurveyEditorPageStore.getState().setIsOpenSurveysLogoDialog(true);
      expect(useSurveyEditorPageStore.getState().isOpenSurveysLogoDialog).toBe(true);
    });

    it('setIsOpenSaveSurveyDialog updates state', () => {
      useSurveyEditorPageStore.getState().setIsOpenSaveSurveyDialog(true);
      expect(useSurveyEditorPageStore.getState().isOpenSaveSurveyDialog).toBe(true);
    });

    it('setIsOpenSharePublicSurveyDialog updates state and publicSurveyId', () => {
      useSurveyEditorPageStore.getState().setIsOpenSharePublicSurveyDialog(true, 'survey-xyz');

      const state = useSurveyEditorPageStore.getState();
      expect(state.isOpenSharePublicSurveyDialog).toBe(true);
      expect(state.publicSurveyId).toBe('survey-xyz');
    });

    it('closeSharePublicSurveyDialog resets dialog and publicSurveyId', () => {
      useSurveyEditorPageStore.getState().setIsOpenSharePublicSurveyDialog(true, 'survey-xyz');
      useSurveyEditorPageStore.getState().closeSharePublicSurveyDialog();

      const state = useSurveyEditorPageStore.getState();
      expect(state.isOpenSaveSurveyDialog).toBe(false);
      expect(state.publicSurveyId).toBe('');
    });
  });

  describe('storedSurvey', () => {
    it('updateStoredSurvey sets the stored survey', () => {
      const survey = createMockSurvey({ id: 'stored-1' });
      useSurveyEditorPageStore.getState().updateStoredSurvey(survey);

      expect(useSurveyEditorPageStore.getState().storedSurvey).toEqual(survey);
    });

    it('resetStoredSurvey clears the stored survey', () => {
      const survey = createMockSurvey({ id: 'stored-1' });
      useSurveyEditorPageStore.getState().updateStoredSurvey(survey);
      useSurveyEditorPageStore.getState().resetStoredSurvey();

      expect(useSurveyEditorPageStore.getState().storedSurvey).toBeUndefined();
    });
  });

  describe('reset', () => {
    it('returns state to initial values', () => {
      useSurveyEditorPageStore.getState().setIsOpenSurveysLogoDialog(true);
      useSurveyEditorPageStore.getState().setIsOpenSaveSurveyDialog(true);

      useSurveyEditorPageStore.getState().reset();

      const state = useSurveyEditorPageStore.getState();
      expect(state.isOpenSurveysLogoDialog).toBe(false);
      expect(state.isOpenSaveSurveyDialog).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isUploadingFile).toBe(false);
      expect(state.isOpenSharePublicSurveyDialog).toBe(false);
      expect(state.publicSurveyId).toBe('');
      expect(state.storedSurvey).toBeUndefined();
    });
  });
});
