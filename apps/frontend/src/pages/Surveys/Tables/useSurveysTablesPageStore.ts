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

import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import {
  PUBLIC_SURVEYS,
  SURVEY_CAN_PARTICIPATE_ENDPOINT,
  SURVEY_FIND_ONE_ENDPOINT,
  SURVEY_HAS_ANSWERS_ENDPOINT,
  SURVEYS,
} from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyStatus from '@libs/survey/survey-status-enum';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { HttpStatusCode } from 'axios';

interface SurveysTablesPageStore {
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  fetchSelectedSurvey: (surveyId: string | undefined, isPublic: boolean) => Promise<void>;
  isFetching: boolean;

  canParticipateSelectedSurvey: (surveyId?: string, isPublic?: boolean) => Promise<void>;
  canParticipate: boolean;

  hasAnswersSelectedSurvey: (surveyId?: string) => Promise<void>;
  hasAnswers: boolean;

  updateUsersSurveys: () => Promise<void>;

  openSurveys: SurveyDto[];
  updateOpenSurveys: () => Promise<void>;
  isFetchingOpenSurveys: boolean;

  createdSurveys: SurveyDto[];
  updateCreatedSurveys: () => Promise<void>;
  isFetchingCreatedSurveys: boolean;

  answeredSurveys: SurveyDto[];
  updateAnsweredSurveys: () => Promise<void>;
  isFetchingAnsweredSurveys: boolean;

  selectedRows: RowSelectionState;
  setSelectedRows: (rows: RowSelectionState) => void;

  reset: () => void;
}

const SurveysTablesPageStoreInitialState: Partial<SurveysTablesPageStore> = {
  selectedSurvey: undefined,

  canParticipate: false,
  hasAnswers: false,

  answeredSurveys: [],
  isFetchingAnsweredSurveys: false,

  createdSurveys: [],
  isFetchingCreatedSurveys: false,

  openSurveys: [],
  isFetchingOpenSurveys: false,

  selectedRows: {},
};

const useSurveyTablesPageStore = create<SurveysTablesPageStore>((set, get) => ({
  ...(SurveysTablesPageStoreInitialState as SurveysTablesPageStore),
  reset: () => set(SurveysTablesPageStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  fetchSelectedSurvey: async (surveyId?: string, isPublic?: boolean): Promise<void> => {
    if (!surveyId) {
      set({ selectedSurvey: undefined });
      return;
    }
    set({ isFetching: true });
    try {
      if (isPublic) {
        const response = await eduApi.get<SurveyDto>(`${PUBLIC_SURVEYS}/${surveyId}`);
        set({ selectedSurvey: response.data });
      } else {
        const response = await eduApi.get<SurveyDto>(`${SURVEY_FIND_ONE_ENDPOINT}/${surveyId}`);
        set({ selectedSurvey: response.data });
      }
    } catch (error) {
      set({ selectedSurvey: undefined });
      handleApiError(error, set);
    } finally {
      set({ isFetching: false });
    }
  },

  canParticipateSelectedSurvey: async (surveyId?: string, isPublic?: boolean): Promise<void> => {
    if (!surveyId) {
      set({ canParticipate: false });
      return;
    }
    if (isPublic) {
      set({ canParticipate: true });
      return;
    }
    try {
      const response = await eduApi.get<boolean>(`${SURVEY_CAN_PARTICIPATE_ENDPOINT}/${surveyId}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- it's a number
      if (response.status === HttpStatusCode.Ok) {
        set({ canParticipate: response.data });
      }
    } catch (error) {
      set({ canParticipate: false });
      handleApiError(error, set);
    }
  },

  hasAnswersSelectedSurvey: async (surveyId?: string): Promise<void> => {
    if (!surveyId) {
      set({ hasAnswers: false });
      return;
    }
    try {
      const response = await eduApi.get<boolean>(`${SURVEY_HAS_ANSWERS_ENDPOINT}/${surveyId}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- it's a number
      if (response.status === HttpStatusCode.Ok) {
        set({ hasAnswers: response.data });
      }
    } catch (error) {
      set({ hasAnswers: false });
      handleApiError(error, set);
    }
  },

  updateUsersSurveys: async (): Promise<void> => {
    const { updateOpenSurveys, updateCreatedSurveys, updateAnsweredSurveys } = get();
    const promises = [updateOpenSurveys(), updateCreatedSurveys(), updateAnsweredSurveys()];
    await Promise.all(promises);
  },

  updateOpenSurveys: async (): Promise<void> => {
    set({ isFetchingOpenSurveys: true });
    try {
      const response = await eduApi.get<SurveyDto[]>(SURVEYS, { params: { status: SurveyStatus.OPEN } });
      const surveys = response.data;
      set({ openSurveys: surveys });
    } catch (error) {
      set({ openSurveys: [] });
      handleApiError(error, set);
    } finally {
      set({ isFetchingOpenSurveys: false });
    }
  },

  updateCreatedSurveys: async (): Promise<void> => {
    set({ isFetchingCreatedSurveys: true });
    try {
      const response = await eduApi.get<SurveyDto[]>(SURVEYS, { params: { status: SurveyStatus.CREATED } });
      const surveys = response.data;
      set({ createdSurveys: surveys });
    } catch (error) {
      set({ createdSurveys: [] });
      handleApiError(error, set);
    } finally {
      set({ isFetchingCreatedSurveys: false });
    }
  },

  updateAnsweredSurveys: async (): Promise<void> => {
    set({ isFetchingAnsweredSurveys: true });
    try {
      const response = await eduApi.get<SurveyDto[]>(SURVEYS, { params: { status: SurveyStatus.ANSWERED } });
      const surveys = response.data;
      set({ answeredSurveys: surveys });
    } catch (error) {
      set({ answeredSurveys: [] });
      handleApiError(error, set);
    } finally {
      set({ isFetchingAnsweredSurveys: false });
    }
  },

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
}));

export default useSurveyTablesPageStore;
