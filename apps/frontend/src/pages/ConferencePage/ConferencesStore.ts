import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { CONFERENCES_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';

interface ConferencesStore {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  setConferences: (conferences: ConferenceDto[]) => void;
  conferences: ConferenceDto[];
  runningConferences: ConferenceDto[];
  isLoading: boolean;
  error: Error | null;
  getConferences: (isLoading?: boolean) => Promise<void>;
  deleteConferences: (conferences: ConferenceDto[]) => Promise<void>;
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

const useConferenceStore = create<ConferencesStore>((set, get) => ({
  ...initialValues,

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
  setConferences: (conferences: ConferenceDto[]) => {
    const runningConferences = conferences.filter((c) => c.isRunning);
    set({ conferences, runningConferences });
  },

  getConferences: async (isLoading = true) => {
    set({ isLoading, error: null });
    try {
      const { data } = await eduApi.get<ConferenceDto[]>(CONFERENCES_EDU_API_ENDPOINT);
      get().setConferences(data);
    } catch (error) {
      handleApiError(error, set);
      set({ conferences: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  setIsDeleteConferencesDialogOpen: (isOpen) => set({ isDeleteConferencesDialogOpen: isOpen }),
  deleteConferences: async (conferences: ConferenceDto[]) => {
    set({ isLoading: true });
    try {
      const { data } = await eduApi.delete<ConferenceDto[]>(CONFERENCES_EDU_API_ENDPOINT, {
        data: conferences.map((c) => c.meetingID),
      });
      set({ conferences: data, selectedRows: {} });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
  toggleConferenceRunningState: async (meetingID) => {
    set({ toggleConferenceRunningStateIsLoading: true });
    try {
      const { data } = await eduApi.put<ConferenceDto[]>(CONFERENCES_EDU_API_ENDPOINT, { meetingID });
      set({ conferences: data });
    } catch (error) {
      handleApiError(error, set, 'toggleConferenceRunningStateError');
    } finally {
      set({ toggleConferenceRunningStateIsLoading: false });
    }
  },
  reset: () => set(initialValues),
}));

export default useConferenceStore;
