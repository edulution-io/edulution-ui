/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { create } from 'zustand';
import { AxiosError } from 'axios';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { CONFERENCES_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import { toast } from 'sonner';
import i18n from '@/i18n';

interface UseCreateConferenceDialogStore {
  isCreateConferenceDialogOpen: boolean;
  openCreateConferenceDialog: () => void;
  closeCreateConferenceDialog: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;
  createConference: (conference: CreateConferenceDto) => Promise<void>;
  createdConference: ConferenceDto | null;
}

const initialState: Partial<UseCreateConferenceDialogStore> = {
  isCreateConferenceDialogOpen: false,
  isLoading: false,
  error: null,
  createdConference: null,
};

const useCreateConferenceDialogStore = create<UseCreateConferenceDialogStore>((set) => ({
  ...(initialState as UseCreateConferenceDialogStore),
  openCreateConferenceDialog: () => set({ isCreateConferenceDialogOpen: true }),
  closeCreateConferenceDialog: () => set({ isCreateConferenceDialogOpen: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  createConference: async (conference) => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.post<ConferenceDto>(CONFERENCES_EDU_API_ENDPOINT, conference);
      set({ createdConference: response.data, isCreateConferenceDialogOpen: false });
      toast.success(i18n.t('conferences.conferenceCreatedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useCreateConferenceDialogStore;
