import { create } from 'zustand';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import SurveyDto from '@libs/survey/types/survey.dto';
import SURVEYS_ENDPOINT from '@libs/survey/surveys-endpoint';
import AttendeeDto from '@libs/conferences/types/attendee.dto';
import UpdateOrCreateSurveyDto from '@libs/survey/types/update-or-create-survey.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface SurveyEditorFormStore {
  reset: () => void;

  participants: AttendeeDto[];

  surveyName: string;
  surveyFormula: string;
  setSurveyFormula: (creatorText: string) => void;
  saveNo: number | undefined;
  setSaveNumber: (saveNo: number) => void;
  created: Date | undefined;

  isOpenSaveSurveyDialog: boolean;
  openSaveSurveyDialog: () => void;
  closeSaveSurveyDialog: () => void;
  expirationDate: Date | undefined;
  expirationTime: string | undefined;
  isAnonymous: boolean | undefined;
  newParticipants: AttendeeDto[];
  updateOrCreateSurvey: (survey: UpdateOrCreateSurveyDto) => Promise<SurveyDto>;
  isLoading: boolean;
  error: AxiosError | null;
}

const initialState: Partial<SurveyEditorFormStore> = {
  participants: [],

  surveyName: '',
  surveyFormula: '',
  saveNo: undefined,
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

  updateOrCreateSurvey: async (survey: UpdateOrCreateSurveyDto): Promise<SurveyDto> => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.post<SurveyDto>(SURVEYS_ENDPOINT, survey);
      set({ error: undefined, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error instanceof AxiosError ? error : null, isLoading: false });
      toast.error(
        error instanceof AxiosError ? `${error.name}: ${error.message}` : 'Error while posting a new/updated survey',
      );
      handleApiError(error, set);
      throw error;
    }
  },
}));

export default useSurveyEditorFormStore;
