import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import { CONFERENCES_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import Conference from '@libs/conferences/types/conference.dto';

interface ConferencesStore {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  conferences: Conference[];
  isLoading: boolean;
  error: Error | null;
  getConferences: (isLoading?: boolean) => Promise<void>;
  deleteConferences: (conferences: Conference[]) => Promise<void>;
  isDeleteConferencesDialogOpen: boolean;
  setIsDeleteConferencesDialogOpen: (isOpen: boolean) => void;
  toggleConferenceRunningState: (conferenceID: string) => Promise<void>;
  toggleConferenceRunningStateIsLoading: boolean;
  toggleConferenceRunningStateError: Error | null;
  reset: () => void;
}

const initialValues = {
  conferences: [],
  isLoading: false,
  error: null,
  selectedRows: {},
  toggleConferenceRunningStateError: null,
  toggleConferenceRunningStateIsLoading: false,
  isDeleteConferencesDialogOpen: false,
};

const useConferenceStore = create<ConferencesStore>((set) => ({
  ...initialValues,

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),

  getConferences: async (isLoading = true) => {
    set({ isLoading, error: null });
    try {
      const response = await eduApi.get<Conference[]>(CONFERENCES_EDU_API_ENDPOINT);
      set({ conferences: response.data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setIsDeleteConferencesDialogOpen: (isOpen) => set({ isDeleteConferencesDialogOpen: isOpen }),
  deleteConferences: async (conferences: Conference[]) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.delete<Conference[]>(CONFERENCES_EDU_API_ENDPOINT, {
        data: conferences.map((c) => c.meetingID),
      });
      set({ conferences: response.data, selectedRows: {} });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
  toggleConferenceRunningState: async (meetingID) => {
    set({ toggleConferenceRunningStateIsLoading: true });
    try {
      const response = await eduApi.put<Conference[]>(CONFERENCES_EDU_API_ENDPOINT, { meetingID });
      set({ conferences: response.data });
    } catch (error) {
      handleApiError(error, set, 'toggleConferenceRunningStateError');
    } finally {
      set({ toggleConferenceRunningStateIsLoading: false });
    }
  },
  reset: () => set(initialValues),
}));

export default useConferenceStore;
