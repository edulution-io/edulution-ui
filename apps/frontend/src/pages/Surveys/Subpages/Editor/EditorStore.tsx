import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey';
import SURVEY_ENDPOINT from '@/pages/Surveys/Subpages/components/survey-endpoint.ts';

interface EditorStore {
  isOpenPropagateSurveyDialog: boolean;
  openPropagateSurveyDialog: () => void;
  closePropagateSurveyDialog: () => void;

  Name: string;
  Formula: string;
  setCreatorText: (creatorText: string) => void;
  saveNo: number | undefined;
  setSaveNumber: (saveNo: number) => void;
  participants: Attendee[];
  participated: string[];
  created: Date | undefined;
  expires: Date | undefined;

  isAnonymous: boolean | undefined;

  commitSurvey: (
    surveyname: string,
    survey?: string,
    participants?: Attendee[],
    participated?: string[],
    saveNo?: number,
    created?: Date,
    expires?: Date,
    isAnonymous?: boolean,
    canSubmitMultipleAnswers?: boolean,
  ) => Promise<Survey | undefined>;

  setIsSaving: (isLoading: boolean) => void;
  isSaving: boolean;
  error: AxiosError | null;

  questionAdded: boolean;
  setQuestionAdded: (questionAdded: boolean) => void;

  reset: () => void;
}

const initialState: Partial<EditorStore> = {
  isOpenPropagateSurveyDialog: false,
  Name: '',
  Formula: '',
  saveNo: undefined,
  participants: [],
  participated: [],
  created: undefined,
  expires: undefined,
  isSaving: false,
  error: null,

  questionAdded: false,
};

const useEditorStore = create<EditorStore>((set) => ({
  ...(initialState as EditorStore),
  openPropagateSurveyDialog: () => set({ isOpenPropagateSurveyDialog: true }),
  closePropagateSurveyDialog: () => set({ isOpenPropagateSurveyDialog: false }),
  setIsSaving: (isSaving: boolean) => set({ isSaving }),
  setError: (error: AxiosError) => set({ error }),

  setQuestionAdded: (questionAdded: boolean) => set({ questionAdded }),

  reset: () => set(initialState),

  commitSurvey: async (
    surveyname: string,
    survey?: string,
    participants?: Attendee[],
    participated?: string[],
    saveNo?: number,
    created?: Date,
    expires?: Date,
    isAnonymous: boolean = false,
    canSubmitMultipleAnswers: boolean = false,
  ): Promise<Survey | undefined> => {
    set({ isSaving: true, error: null });
    try {
      const response = await eduApi.post<Survey>(SURVEY_ENDPOINT, {
        surveyname,
        survey,
        participants,
        participated,
        saveNo,
        created,
        expires,
        isAnonymous,
        canSubmitMultipleAnswers,
      });
      set({ error: undefined, isSaving: false });
      return response.data;
    } catch (error) {
      handleApiError(error, set);
      set({ error: error, isSaving: false });
    }
  },
}));

export default useEditorStore;
