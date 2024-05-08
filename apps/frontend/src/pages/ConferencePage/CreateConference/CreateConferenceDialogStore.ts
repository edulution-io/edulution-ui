import { create } from 'zustand';
import axios from 'axios';
import { ConferencesAPIsResponse } from '@/pages/ConferencePage/model';
import handleApiError from '@/utils/handleApiError';

interface CreateConferenceDialogStore {
  isCreateConferenceDialogOpen: boolean;
  openCreateConferenceDialog: () => void;
  closeCreateConferenceDialog: () => void;
  isLoading: boolean;
  error: Error | null;
  createConference: (meetingID: string, name: string, dialNumber: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  newConference: {},
  error: null,
  isLoading: false,
  isCreateNewConferenceDialogOpen: false,
};

const useCreateConferenceDialogStore = create<CreateConferenceDialogStore>((set) => ({
  isCreateConferenceDialogOpen: false,
  openCreateConferenceDialog: () => set({ isCreateConferenceDialogOpen: true }),
  closeCreateConferenceDialog: () => set({ isCreateConferenceDialogOpen: false }),
  isLoading: false,
  error: null,
  createConference: async (meetingID: string, name: string, dialNumber: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<ConferencesAPIsResponse>('http://localhost:3000/api/create', {
        meetingID,
        name,
        dialNumber,
      });
      console.log(response);
      set({ isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  reset: () => set(initialState),
}));

export default useCreateConferenceDialogStore;
