import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import handleApiError from '@/utils/handleApiError';
import eduApi from '@/api/eduApi';
import apiEndpoint from '@/pages/ConferencePage/apiEndpoint';
import { Conference } from '@/pages/ConferencePage/dto/conference.dto';

interface ConferencesStore {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  conferences: Conference[];
  isLoading: boolean;
  error: Error | null;
  getConferences: (isLoading?: boolean) => Promise<void>;
  deleteConferences: (conferences: Conference[]) => Promise<void>;
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
};

const useConferenceStore = create<ConferencesStore>((set) => ({
  ...initialValues,

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),

  getConferences: async (isLoading = true) => {
    set({ isLoading, error: null });
    try {
      const response = await eduApi.get<Conference[]>(apiEndpoint);
      set({ conferences: response.data, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteConferences: async (conferences: Conference[]) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.delete<Conference[]>(apiEndpoint, {
        data: conferences.map((c) => c.meetingID),
      });
      set({ conferences: response.data, isLoading: false, selectedRows: {} });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
  toggleConferenceRunningState: async (meetingID) => {
    set({ toggleConferenceRunningStateIsLoading: true });
    try {
      const response = await eduApi.put<Conference[]>(apiEndpoint, { meetingID });
      set({ conferences: response.data, toggleConferenceRunningStateIsLoading: false });
    } catch (error) {
      handleApiError(error, set, 'toggleConferenceRunningStateError');
    } finally {
      set({ toggleConferenceRunningStateIsLoading: false });
    }
  },
  reset: () => set(initialValues),
}));

export default useConferenceStore;
