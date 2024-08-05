import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import SURVEYS_ENDPOINT from '@libs/survey/surveys-endpoint';
import SurveyDto from '@libs/survey/types/survey.dto';
import SurveysPageView from '@libs/survey/types/page-view';
import SurveyStatus from '@libs/survey/types/survey-status-enum';
import handleApiError from '@/utils/handleApiError';
import SurveysTablesPageStore from '@/pages/Surveys/Tables/surveysTablePageStore';
import SurveysTablesPageStoreInitialState from '@/pages/Surveys/Tables/surveysTablePageStoreInitialState';

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
}));

export default useSurveyTablesPageStore;
