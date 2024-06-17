import { create } from 'zustand';
import { AxiosError } from 'axios';
import { Survey } from '@libs/survey/types/survey';
import Attendee from '@libs/conferences/types/attendee';
import SURVEY_ENDPOINT from '@libs/survey/surveys-endpoint';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface SurveyEditorFormStore {
  reset: () => void;

  Name: string;
  Formula: string;
  setCreatorText: (creatorText: string) => void;
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
  commitSurvey: (
    id: number,
    formula: JSON,
    participants?: Attendee[],
    participated?: string[],
    saveNo?: number,
    created?: Date,
    expirationDate?: Date,
    expirationTime?: string,
    isAnonymous?: boolean,
    canSubmitMultipleAnswers?: boolean,
  ) => Promise<Survey | undefined>;
  isCommiting: boolean;
  errorCommiting: AxiosError | null;
}

const initialState: Partial<SurveyEditorFormStore> = {
  Name: '',
  Formula: '',
  saveNo: undefined,
  participants: [],
  participated: [],
  created: undefined,
  expirationDate: undefined,
  expirationTime: undefined,
  isCommiting: false,
  errorCommiting: null,

  isOpenSaveSurveyDialog: false,
  newParticipants: [],
};

const useSurveyEditorFormStore = create<SurveyEditorFormStore>((set) => ({
  ...(initialState as SurveyEditorFormStore),
  reset: () => set(initialState),

  openSaveSurveyDialog: () => set({ isOpenSaveSurveyDialog: true }),
  closeSaveSurveyDialog: () => set({ isOpenSaveSurveyDialog: false }),

  commitSurvey: async (
    id: number,
    formula: JSON,
    participants?: Attendee[],
    participated?: string[],
    saveNo?: number,
    created?: Date,
    expirationDate?: Date,
    expirationTime?: string,
    isAnonymous: boolean = false,
    canSubmitMultipleAnswers: boolean = false,
  ): Promise<Survey | undefined> => {
    set({ isCommiting: true, errorCommiting: null });
    try {
      const response = await eduApi.post<Survey>(SURVEY_ENDPOINT, {
        id,
        formula,
        participants,
        participated,
        saveNo,
        created,
        expirationDate,
        expirationTime,
        isAnonymous,
        canSubmitMultipleAnswers,
      });
      set({ errorCommiting: undefined, isCommiting: false });
      return response.data;
    } catch (error) {
      handleApiError(error, set);
      set({ errorCommiting: error as AxiosError, isCommiting: false });
      return undefined;
    }
  },
}));

export default useSurveyEditorFormStore;
