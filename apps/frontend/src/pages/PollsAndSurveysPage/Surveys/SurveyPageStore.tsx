import { create } from 'zustand';
import { Survey } from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/model';
import deleteSurvey from '@/pages/PollsAndSurveysPage/Surveys/components/dto/delete-survey.dto.ts';
import handleApiError from '@/utils/handleApiError.ts';
import UsersSurveysTypes from '@/pages/PollsAndSurveysPage/Surveys/backend-copy/users-surveys-types-enum.dto.ts';

export interface SurveyUpdateSelection {
  survey: Survey | undefined;
  surveyType: UsersSurveysTypes;
}

interface SurveyPageStore {
  selectedSurvey: Survey | undefined;
  setSelectedSurvey: (selectSurvey: Survey | undefined) => void;

  selectedType: UsersSurveysTypes | undefined;
  setSelectedType: (selectType: UsersSurveysTypes | undefined) => void;

  updateSurveySelection: (selection: SurveyUpdateSelection) => void;

  deleteSurvey: () => Promise<void>;

  refreshOpen: boolean;
  shouldRefreshOpen: () => void;
  finishRefreshOpen: () => void;

  refreshCreated: boolean;
  shouldRefreshCreated: () => void;
  finishRefreshCreated: () => void;

  refreshParticipated: boolean;
  shouldRefreshParticipated: () => void;
  finishRefreshParticipated: () => void;

  refreshGlobalList: boolean;
  shouldRefreshGlobalList: () => void;
  finishRefreshGlobalList: () => void;

  isOpenEditSurveyDialog: boolean;
  openEditSurveyDialog: () => void;
  closeEditSurveyDialog: () => void;

  isOpenParticipateSurveyDialog: boolean;
  openParticipateSurveyDialog: () => void;
  closeParticipateSurveyDialog: () => void;

  isOpenSurveyResultsDialog: boolean;
  openSurveyResultsDialog: () => void;
  closeSurveyResultsDialog: () => void;

  isPageLoading: boolean;
  setIsPageLoading: (loading: boolean) => void;
  error: Error | null;
  reset: () => void;
}

const initialState: Partial<SurveyPageStore> = {
  selectedSurvey: undefined,
  selectedType: undefined,

  refreshOpen: true,
  refreshCreated: true,
  refreshParticipated: true,
  refreshGlobalList: true,

  isOpenEditSurveyDialog: false,
  isOpenParticipateSurveyDialog: false,
  isOpenSurveyResultsDialog: false,

  isPageLoading: false,
};

const useSurveyPageStore = create<SurveyPageStore>((set) => ({
  ...(initialState as SurveyPageStore),
  setSelectedSurvey: (selectSurvey: Survey | undefined) => set({ selectedSurvey: selectSurvey }),
  setSelectedType: (type: UsersSurveysTypes | undefined) => set({ selectedType: type }),
  updateSurveySelection: ({ survey, surveyType }: SurveyUpdateSelection) =>
    set({ selectedSurvey: survey, selectedType: surveyType }),
  deleteSurvey: async () => {
    const surveyName = useSurveyPageStore.getState().selectedSurvey?.surveyname;
    if (!surveyName) {
      return;
    }
    try {
      await deleteSurvey(surveyName);
    } catch (error) {
      handleApiError(error, set);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    }
  },
  shouldRefreshOpen: () => set({ refreshOpen: true }),
  finishRefreshOpen: () => set({ refreshOpen: false }),
  shouldRefreshCreated: () => set({ refreshCreated: true }),
  finishRefreshCreated: () => set({ refreshCreated: false }),
  shouldRefreshParticipated: () => set({ refreshParticipated: true }),
  finishRefreshParticipated: () => set({ refreshParticipated: false }),

  openEditSurveyDialog: () => set({ isOpenEditSurveyDialog: true }),
  closeEditSurveyDialog: () => set({ isOpenEditSurveyDialog: false }),
  openParticipateSurveyDialog: () => set({ isOpenParticipateSurveyDialog: true }),
  closeParticipateSurveyDialog: () => set({ isOpenParticipateSurveyDialog: false }),
  openSurveyResultsDialog: () => set({ isOpenSurveyResultsDialog: true }),
  closeSurveyResultsDialog: () => set({ isOpenSurveyResultsDialog: false }),

  setIsPageLoading: (loading: boolean) => set({ isPageLoading: loading }),
  reset: () => set(initialState),
}));

export default useSurveyPageStore;
