import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import { USERS_SEARCH_EDU_API_ENDPOINT } from '@/api/useUserQuery';
import handleApiError from '@/utils/handleApiError';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import { Survey } from '@/pages/Surveys/Subpages/components/types/survey';
import SURVEY_ENDPOINT from '@/pages/Surveys/Subpages/components/survey-endpoint.ts';

interface EditorStore {
  Name: string;
  Formula: string;
  setCreatorText: (creatorText: string) => void;
  saveNo: number | undefined;
  setSaveNumber: (saveNo: number) => void;
  participants: Attendee[];
  created: Date | undefined;
  expires: Date | undefined;

  isAnonymous: boolean | undefined;
  commitSurvey: (
    surveyname: string,
    survey?: string,
    participants?: Attendee[],
    saveNo?: number,
    created?: Date,
    expires?: Date,
    isAnonymous?: boolean,
    canSubmitMultipleAnswers?: boolean,
  ) => Promise<Survey | undefined>;

  searchAttendees: (searchQuery: string) => Promise<Attendee[]>;
  searchAttendeesResult: Attendee[];
  setIsSaving: (isLoading: boolean) => void;
  isSaving: boolean;
  error: AxiosError | null;
  reset: () => void;
}

const initialState: Partial<EditorStore> = {
  Name: '',
  Formula: '',
  saveNo: undefined,
  participants: [],
  created: undefined,
  expires: undefined,
  searchAttendeesResult: [],
  isSaving: false,
  error: null,
};

const useEditorStore = create<EditorStore>((set) => ({
  ...(initialState as EditorStore),
  setIsSaving: (isSaving: boolean) => set({ isSaving }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  commitSurvey: async (
    surveyname: string,
    survey?: string,
    participants?: Attendee[],
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

  searchAttendees: async (searchParam) => {
    set({ error: null });
    try {
      const response = await eduApi.get<Attendee[]>(`${USERS_SEARCH_EDU_API_ENDPOINT}${searchParam}`);

      if (!Array.isArray(response.data)) {
        return [];
      }

      const searchAttendeesResult = response.data?.map((d) => ({
        ...d,
        value: d.username,
        label: `${d.firstName} ${d.lastName} (${d.username})`,
      }));

      set({ searchAttendeesResult });
      return searchAttendeesResult;
    } catch (error) {
      handleApiError(error, set);
      return [];
    }
  },
}));

export default useEditorStore;
