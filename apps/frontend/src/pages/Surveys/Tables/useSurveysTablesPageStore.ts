import { create } from 'zustand';
import { Row, RowSelectionState } from '@tanstack/react-table';
import {
  SURVEYS,
  PUBLIC_SURVEYS,
  SURVEY_FIND_ONE_ENDPOINT,
  SURVEY_CAN_PARTICIPATE_ENDPOINT,
  SURVEY_HAS_ANSWERS_ENDPOINT,
} from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyStatus from '@libs/survey/survey-status-enum';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface SurveysTablesPageStore {
  selectedSurvey: SurveyDto | undefined;
  selectSurvey: (survey: SurveyDto | undefined) => void;

  updateSelectedSurvey: (surveyId: string | undefined, isPublic: boolean) => Promise<void>;
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

  onClickSurveysTableCell: (row: Row<SurveyDto>) => void;

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

  updateSelectedSurvey: async (surveyId?: string, isPublic?: boolean): Promise<void> => {
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
      set({ canParticipate: response.data });
    } catch (error) {
      handleApiError(error, set);
      set({ canParticipate: false });
    }
  },

  hasAnswersSelectedSurvey: async (surveyId?: string): Promise<void> => {
    if (!surveyId) {
      set({ hasAnswers: false });
      return;
    }
    try {
      const response = await eduApi.get<boolean>(`${SURVEY_HAS_ANSWERS_ENDPOINT}/${surveyId}`);
      set({ hasAnswers: response.data });
    } catch (error) {
      handleApiError(error, set);
      set({ hasAnswers: false });
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

  onClickSurveysTableCell: (row: Row<SurveyDto>) => {
    const wasSelectedPreviously = row.getIsSelected();
    row.toggleSelected();

    if (!wasSelectedPreviously) {
      const { canParticipateSelectedSurvey, hasAnswersSelectedSurvey } = get();
      set({ selectedSurvey: row.original });
      void canParticipateSelectedSurvey(row.original.id.toString());
      void hasAnswersSelectedSurvey(row.original.id.toString());
    } else {
      set({ selectedSurvey: undefined, canParticipate: false, hasAnswers: false });
    }
  },
}));

export default useSurveyTablesPageStore;
