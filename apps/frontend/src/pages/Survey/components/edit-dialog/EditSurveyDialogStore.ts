import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { USERS_SEARCH_EDU_API_ENDPOINT } from '@/api/useUserQuery';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import { Survey } from '@/pages/Survey/backend-copy/model';
import saveSurveyJson from '@/pages/Survey/components/dto/save-update-survey.dto';

interface EditSurveyDialogStore {
  isEditSurveyDialogOpen: boolean;
  openEditSurveyDialog: () => void;
  closeEditSurveyDialog: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;

  editSurvey: Survey | undefined;
  setEditSurvey: (survey: Survey | undefined) => void;

  saveSurvey: (
    surveyName: string,
    surveyFormula: JSON,
    surveyParticipants: Attendee[],
    saveNo: number,
    callback: (saNo: number, b: boolean) => Promise<void>,
  ) => void;

  participants: Attendee[];
  setParticipants: (attendees: Attendee[]) => void;

  searchAttendees: (searchQuery: string) => Promise<Attendee[]>;
  searchAttendeesResult: Attendee[];
}

const initialState: Partial<EditSurveyDialogStore> = {
  isEditSurveyDialogOpen: false,
  isLoading: false,
  error: null,
  editSurvey: undefined,
  searchAttendeesResult: [],
  participants: [],
};

const useEditSurveyDialogStore = create<EditSurveyDialogStore>((set) => ({
  ...(initialState as EditSurveyDialogStore),
  setEditSurvey: (survey) => set({ editSurvey: survey }),
  setParticipants: (attendees: Attendee[]) => set({ participants: attendees }),
  openEditSurveyDialog: () => set({ isEditSurveyDialogOpen: true }),
  closeEditSurveyDialog: () => set({ isEditSurveyDialogOpen: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  saveSurvey: async (
    surveyName: string,
    surveyFormula: JSON,
    surveyParticipants: Attendee[],
    saveNo: number,
    callback: (saNo: number, b: boolean) => Promise<void>,
  ) => {
    set({ isLoading: true, error: null });
    try {
      await saveSurveyJson(surveyName, surveyFormula, surveyParticipants, saveNo, callback);
      set({ isLoading: false, isEditSurveyDialogOpen: true });
    } catch (error) {
      handleApiError(error, set);
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

export default useEditSurveyDialogStore;
