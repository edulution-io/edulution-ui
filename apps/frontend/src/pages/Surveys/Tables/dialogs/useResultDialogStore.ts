import { create } from 'zustand';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SURVEY_RESULT_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import ResultDialogStoreInitialState from '@libs/survey/types/tables/dialogs/resultDialogStoreInitialState';
import ResultDialogStore from '@libs/survey/types/tables/dialogs/resultDialogStore';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useResultDialogStore = create<ResultDialogStore>((set) => ({
  ...(ResultDialogStoreInitialState as ResultDialogStore),
  reset: () => set(ResultDialogStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  setIsOpenPublicResultsTableDialog: (state: boolean) => set({ isOpenPublicResultsTableDialog: state }),
  setIsOpenPublicResultsVisualisationDialog: (state: boolean) => set({ isOpenPublicResultsVisualisationDialog: state }),

  getSurveyResult: async (surveyId: string): Promise<void> => {
    set({ isLoading: true });
    try {
      // TODO: Issue 388: [REPORT] Survey - rework ids to only use the timestamps in the frontend
      const response = await eduApi.get<JSON[]>(`${SURVEY_RESULT_ENDPOINT}/${surveyId.toString()}`);
      const result = response.data;
      set({ result });
    } catch (error) {
      handleApiError(error, set);
      set({ result: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useResultDialogStore;
