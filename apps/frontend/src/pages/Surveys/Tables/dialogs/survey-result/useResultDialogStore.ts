import mongoose from 'mongoose';
import { create } from 'zustand';
import SurveyDto from '@libs/survey/types/survey.dto';
import { SURVEY_RESULT_ENDPOINT } from '@libs/survey/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import ResultDialogStoreInitialState from '@/pages/Surveys/Tables/dialogs/survey-result/resultDialogStoreInitialState';
import ResultDialogStore from './resultDialogStore';

const useResultDialogStore = create<ResultDialogStore>((set) => ({
  ...(ResultDialogStoreInitialState as ResultDialogStore),
  reset: () => set(ResultDialogStoreInitialState),

  selectSurvey: (survey: SurveyDto | undefined) => set({ selectedSurvey: survey }),

  setIsOpenPublicResultsTableDialog: (state: boolean) => set({ isOpenPublicResultsTableDialog: state }),
  setIsOpenPublicResultsVisualisationDialog: (state: boolean) => set({ isOpenPublicResultsVisualisationDialog: state }),

  getSurveyResult: async (surveyId: mongoose.Types.ObjectId): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await eduApi.get<JSON[]>(`${SURVEY_RESULT_ENDPOINT}${surveyId.toString('base64')}`);
      const result = response.data;
      set({ result, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
      set({ result: undefined, isLoading: false });
    }
  },
}));

export default useResultDialogStore;
