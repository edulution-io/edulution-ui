import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import { USERS_SEARCH_EDU_API_ENDPOINT } from '@/api/useUserQuery';
import handleApiError from '@/utils/handleApiError';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import commitPollUpdate from '@/pages/PollsAndSurveysPage/Polls/components/dto/commit-poll-update.dto.ts';

interface EditPollDialogStore {
  isSaving: boolean;
  setIsSaving: (isLoading: boolean) => void;
  error: AxiosError | null;
  reset: () => void;

  surveyFormula: string;
  saveNo: number | undefined;

  saveSurveyLocally: (creatorText: string, saveNo: number, callback: (saNo: number, b: boolean) => void) => void;

  commitSurvey: (
    pollName: string,
    pollFormula: string,
    pollParticipants: Attendee[],
    saveNo?: number,
    created?: Date,
  ) => void;

  searchAttendees: (searchQuery: string) => Promise<Attendee[]>;
  searchAttendeesResult: Attendee[];
}

const initialState: Partial<EditPollDialogStore> = {
  isSaving: false,
  error: null,
  searchAttendeesResult: [],
  surveyFormula: '',
  saveNo: undefined,
};

const useEditPollDialogStore = create<EditPollDialogStore>((set) => ({
  ...(initialState as EditPollDialogStore),
  setIsSaving: (isSaving) => set({ isSaving }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  saveSurveyLocally: (creatorText: string, saveNo: number, callback: (saNo: number, b: boolean) => void) => set({ isSaving }),

  commitSurvey: async (
    surveyName: string,
    surveyFormula: string,
    surveyParticipants: Attendee[],
    saveNo?: number,
    created?: Date,
  ) => {
    set({ isSaving: true, error: null });
    try {
      await commitPollUpdate(surveyName, surveyFormula, surveyParticipants, saveNo, created);
      set({ error: undefined, isSaving: false });
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

export default useEditPollDialogStore;
