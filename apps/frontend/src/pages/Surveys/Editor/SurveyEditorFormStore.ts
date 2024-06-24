import { create } from 'zustand';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Survey } from '@libs/survey/types/survey';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import SURVEY_ENDPOINT from '@libs/survey/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import UpdateOrCreateSurveyDto from "@libs/survey/dto/update-or-create-survey.dto";

interface SurveyEditorFormStore {
  reset: () => void;

  surveyName: string;
  surveyFormula: string;
  setSurveyFormula: (creatorText: string) => void;
  saveNo: number | undefined;
  setSaveNumber: (saveNo: number) => void;
  participants: Attendee[];
  participated: string[];
  created: Date | undefined;

  isOpenSaveSurveyDialog: boolean;
  openSaveSurveyDialog: () => void;
  closeSaveSurveyDialog: () => void;
  expirationDate: Date | undefined;
  expirationTime: string | undefined;
  isAnonymous: boolean | undefined;
  newParticipants: Attendee[];
  updateOrCreateSurvey: (survey: UpdateOrCreateSurveyDto) => Promise<Survey | undefined>;
  isLoading: boolean;
  error: AxiosError | null;
}

const initialState: Partial<SurveyEditorFormStore> = {
  surveyName: '',
  surveyFormula: '',
  saveNo: undefined,
  participants: [],
  participated: [],
  created: undefined,
  expirationDate: undefined,
  expirationTime: undefined,
  isLoading: false,
  error: null,

  isOpenSaveSurveyDialog: false,
  newParticipants: [],
};

const useSurveyEditorFormStore = create<SurveyEditorFormStore>((set) => ({
  ...(initialState as SurveyEditorFormStore),
  reset: () => set(initialState),

  openSaveSurveyDialog: () => set({ isOpenSaveSurveyDialog: true }),
  closeSaveSurveyDialog: () => set({ isOpenSaveSurveyDialog: false }),

  updateOrCreateSurvey: async (survey: UpdateOrCreateSurveyDto
  ): Promise<Survey | undefined> => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.post<Survey>(SURVEY_ENDPOINT, survey);
      set({ error: undefined, isLoading: false });
      return response.data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '');

      handleApiError(error, set, 'errorCommiting');
      set({error: error as AxiosError, isLoading: false});
      return undefined;
    }
  },
}));

export default useSurveyEditorFormStore;
