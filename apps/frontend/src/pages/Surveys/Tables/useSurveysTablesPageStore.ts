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
import { Row, RowSelectionState } from '@tanstack/react-table';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveysPageView from '@libs/survey/types/api/page-view';
import SurveyStatus from '@libs/survey/survey-status-enum';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface SurveysTablesPageStore {
  selectedPageView: SurveysPageView;
  updateSelectedPageView: (pageView: SurveysPageView) => void;

  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

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

  isNoSurveySelected: () => boolean;
  isExactlyOneSurveySelected: () => boolean;
  onClickSurveysTableCell: (row: Row<SurveyDto>) => void;

  reset: () => void;
}

const SurveysTablesPageStoreInitialState: Partial<SurveysTablesPageStore> = {
  selectedPageView: SurveysPageView.OPEN,

  selectedSurvey: undefined,

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

  updateSelectedPageView: (pageView: SurveysPageView) => set({ selectedPageView: pageView }),
  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),
  updateUsersSurveys: async (): Promise<void> => {
    const { updateOpenSurveys, updateCreatedSurveys, updateAnsweredSurveys } = get();
    const promises = [updateOpenSurveys(), updateCreatedSurveys(), updateAnsweredSurveys()];
    await Promise.all(promises);
  },

  updateOpenSurveys: async (): Promise<void> => {
    set({ isFetchingOpenSurveys: true });
    try {
      const response = await eduApi.get<SurveyDto[]>(SURVEYS_ENDPOINT, { params: { status: SurveyStatus.OPEN } });
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
      const response = await eduApi.get<SurveyDto[]>(SURVEYS_ENDPOINT, { params: { status: SurveyStatus.CREATED } });
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
      const response = await eduApi.get<SurveyDto[]>(SURVEYS_ENDPOINT, { params: { status: SurveyStatus.ANSWERED } });
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

  isNoSurveySelected: (): boolean => Object.entries(get().selectedRows).length === 0,
  isExactlyOneSurveySelected: (): boolean => Object.entries(get().selectedRows).length === 1,
  onClickSurveysTableCell: (row: Row<SurveyDto>) => {
    if (get().isNoSurveySelected()) {
      set({ selectedSurvey: row.original });
    } else {
      set({ selectedSurvey: undefined });
    }
    row.toggleSelected();
  },
}));

export default useSurveyTablesPageStore;
