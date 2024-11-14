import { create } from 'zustand';
import { Row, RowSelectionState } from '@tanstack/react-table';
import eduApi from '@/api/eduApi';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveysPageView from '@libs/survey/types/api/page-view';
import SurveyStatus from '@libs/survey/survey-status-enum';
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

  onClickSurveysTableCell: (row: Row<SurveyDto>) => {
    set({ selectedRows: {} });

    const survey = row.original;
    const { selectedSurvey } = get();
    if (selectedSurvey && survey.id === selectedSurvey.id) {
      set({ selectedSurvey: undefined });
      return;
    }
    set({ selectedSurvey: survey });

    row.toggleSelected();
  },
}));

export default useSurveyTablesPageStore;
