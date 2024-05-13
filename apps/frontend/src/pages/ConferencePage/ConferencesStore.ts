import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import handleApiError from '@/utils/handleApiError';
import { Conference } from '@/pages/ConferencePage/dto/conference.dto';
import eduApi from '@/api/eduApi';
import apiEndpoint from '@/pages/ConferencePage/apiEndpoint';

interface ConferencesStore {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  conferences: Conference[];
  isLoading: boolean;
  error: Error | null;
  getConferences: (setIsLoading?: boolean) => Promise<void>;
  deleteConferences: (conferences: Conference[]) => Promise<void>;
  updateConference: (conference: Conference) => Promise<void>;
  reset: () => void;
}

const useConferenceStore = create<ConferencesStore>((set) => ({
  selectedRows: {},
  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
  conferences: [],
  isLoading: false,
  error: null,

  getConferences: async (setIsLoading = true) => {
    set({ isLoading: setIsLoading, error: null });
    try {
      const response = await eduApi.get<Conference[]>(apiEndpoint);
      set({ conferences: response.data, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  deleteConferences: async (conferences: Conference[]) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.delete<Conference[]>(apiEndpoint, {
        data: conferences.map((c) => c.meetingID),
      });
      set({ conferences: response.data, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  updateConference: async (conference) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.patch<Conference[]>(apiEndpoint, conference);
      set({ conferences: response.data, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  reset: () => set({ conferences: [], isLoading: false, error: null }),
}));

export default useConferenceStore;
