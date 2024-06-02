import { create } from 'zustand';
import eduApi from '@/api/eduApi.ts';
import { USERS_SEARCH_EDU_API_ENDPOINT } from '@/api/useUserQuery.tsx';
import Attendee from '@/pages/ConferencePage/dto/attendee.ts';
import handleApiError from '@/utils/handleApiError.ts';

interface PropagateSurveyDialogStore {
  isOpenPropagateSurveyDialog: boolean;
  openPropagateSurveyDialog: () => void;
  closePropagateSurveyDialog: () => void;
  searchAttendees: (searchQuery: string) => Promise<Attendee[]>;
  searchAttendeesResult: Attendee[];
  errorSearchAttendees: Error | null;
  reset: () => void;
}

const initialState: Partial<PropagateSurveyDialogStore> = {
  isOpenPropagateSurveyDialog: false,
  searchAttendeesResult: [],
};

const usePropagateSurveyDialogStore = create<PropagateSurveyDialogStore>((set) => ({
  ...(initialState as PropagateSurveyDialogStore),
  openPropagateSurveyDialog: () => set({ isOpenPropagateSurveyDialog: true }),
  closePropagateSurveyDialog: () => set({ isOpenPropagateSurveyDialog: false }),
  reset: () => set(initialState),

  searchAttendees: async (searchParam) => {
    set({ errorSearchAttendees: null });
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
      set({ errorSearchAttendees: error });
      return [];
    }
  },
}));

export default usePropagateSurveyDialogStore;
