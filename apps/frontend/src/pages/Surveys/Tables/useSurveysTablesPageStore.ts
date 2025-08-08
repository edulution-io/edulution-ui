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

import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import {
  SURVEY_CAN_PARTICIPATE_ENDPOINT,
  SURVEY_HAS_ANSWERS_ENDPOINT,
  SURVEYS,
} from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyStatus from '@libs/survey/survey-status-enum';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { HttpStatusCode } from 'axios';
import fetchSelectedSurvey from '@/pages/Surveys/utils/fetchSelectedSurvey';

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

const useSurveysTablesPageStore = create<SurveysTablesPageStore>((set, get) => ({
  ...(SurveysTablesPageStoreInitialState as SurveysTablesPageStore),
  reset: () => set(SurveysTablesPageStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  fetchSelectedSurvey: async (surveyId?: string, isPublic?: boolean): Promise<void> => {
    set({ isFetching: true, selectedSurvey: undefined });
    try {
      const survey = await fetchSelectedSurvey(surveyId, isPublic);
      set({ selectedSurvey: survey });
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

export default useSurveysTablesPageStore;
