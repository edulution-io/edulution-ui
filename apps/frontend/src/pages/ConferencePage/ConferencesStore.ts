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
  getConferences: (setIsLoading?: boolean) => Promise<void>;
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

  getConferences: async (setIsLoading = true) => {
    set({ isLoading: setIsLoading, error: null });
    try {
      const response = await eduApi.get<Conference[]>(apiEndpoint);
      set({ conferences: response.data, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  setIsDeleteConferencesDialogOpen: (isOpen) => set({ isDeleteConferencesDialogOpen: isOpen }),
  deleteConferences: async (conferences: Conference[]) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.delete<Conference[]>(apiEndpoint, {
        data: conferences.map((c) => c.meetingID),
      });
      set({ conferences: response.data, isLoading: false, selectedRows: {} });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  toggleConferenceRunningState: async (meetingID) => {
    set({ toggleConferenceRunningStateIsLoading: true });
    try {
      const response = await eduApi.put<Conference[]>(apiEndpoint, { meetingID });
      set({ conferences: response.data, toggleConferenceRunningStateIsLoading: false });
    } catch (error) {
      handleApiError(error, set, {
        errorName: 'toggleConferenceRunningStateError',
        isLoadingName: 'toggleConferenceRunningStateIsLoading',
      });
    }
  },
  reset: () => set(initialValues),
}));

export default useConferenceStore;
