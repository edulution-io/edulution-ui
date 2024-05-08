import { create } from 'zustand';
import axios from 'axios';
import { RowSelectionState } from '@tanstack/react-table';
import handleApiError from '@/utils/handleApiError';
import { Conference } from '@/pages/ConferencePage/dto/conference.dto';

interface ConferencesStore {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  conferences: Conference[];
  isLoading: boolean;
  error: Error | null;
  getConferences: () => Promise<void>;
  getConferenceInfo: (meetingID: string) => Promise<void>;
  deleteConferences: (conferences: Conference[]) => Promise<void>;
  joinConference: (meetingID: string, fullName: string, role: string) => Promise<void>;
  reset: () => void;
}

const useConferenceStore = create<ConferencesStore>((set) => ({
  selectedRows: {},
  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
  conferences: [],
  isLoading: false,
  error: null,
  getConferences: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<Conference[]>('http://localhost:3000/api/getConferences');
      set({ conferences: response.data, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  getConferenceInfo: async (meetingID: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`http://localhost:3000/api/getConferenceInfo?meetingID=${meetingID}`);
      set({ conferences: [response.data], isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  deleteConferences: async (conferences: Conference[]) => {
    set({ isLoading: true });
    try {
      const response = await axios.delete(`http://localhost:3000/api/deleteConferences`, {
        data: { meetingIDs: conferences.map((c) => c.meetingID) },
      });
      set({ conferences: [response.data], isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  joinConference: async (meetingID: string, fullName: string, role) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(
        `http://localhost:3000/api/join?meetingID=${meetingID}&fullName=${fullName}&role=${role}`,
      );
      console.log('Join meeting response:', response.data);
      set({ isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },
  reset: () => set({ conferences: [], isLoading: false, error: null }),
}));

export default useConferenceStore;
