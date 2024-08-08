import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import Conference from '@libs/conferences/types/conference.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import apiEndpoint from '@/pages/ConferencePage/apiEndpoint';

interface ConferencesStore {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  conferences: Conference[];
  runningConferences: Conference[];
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
  runningConferences: [],
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
      const response = await eduApi.get<Conference[]>(apiEndpoint);
      const conferences = response.data;
      // // TODO: NIEDUUI-287: Instead of filtering the conferences in the frontend we should create a new endpoint that only returns the running conferences
      const runningConferences = conferences.filter((c) => c.isRunning);
      set({ conferences, runningConferences });
    } catch (error) {
      handleApiError(error, set);
      set({ conferences: [], runningConferences: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  setIsDeleteConferencesDialogOpen: (isOpen) => set({ isDeleteConferencesDialogOpen: isOpen }),
  deleteConferences: async (conferences: Conference[]) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.delete<Conference[]>(apiEndpoint, {
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
      const response = await eduApi.put<Conference[]>(apiEndpoint, { meetingID });
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
