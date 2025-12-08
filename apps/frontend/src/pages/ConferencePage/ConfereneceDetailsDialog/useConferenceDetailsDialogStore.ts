/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { create } from 'zustand';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import i18n from '@/i18n';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import {
  CONFERENCES_EDU_API_ENDPOINT,
  CONFERENCES_JOIN_EDU_API_ENDPOINT,
} from '@libs/conferences/constants/apiEndpoints';

interface UseConferenceDetailsDialogStore {
  selectedConference: ConferenceDto | null;
  setSelectedConference: (conference: ConferenceDto | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: AxiosError | null;
  setError: (error: AxiosError) => void;
  reset: () => void;
  joinConference: (meetingID: string, password?: string) => Promise<void>;
  joinConferenceUrl: string;
  setJoinConferenceUrl: (url: string) => void;
  updateConference: (conference: Partial<ConferenceDto>) => Promise<void>;
}

const initialState = {
  selectedConference: null,
  isLoading: false,
  error: null,
  joinConferenceUrl: '',
};

const useConferenceDetailsDialogStore = create<UseConferenceDetailsDialogStore>((set, get) => ({
  ...initialState,
  setSelectedConference: (conference) => set({ selectedConference: conference }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error: AxiosError) => set({ error }),
  reset: () => set(initialState),

  joinConference: async (meetingID, password) => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      if (get().joinConferenceUrl) {
        toast.error(i18n.t('conferences.errors.AlreadyInAnotherMeeting'));
        return;
      }

      const response = await eduApi.get<string>(
        `${CONFERENCES_JOIN_EDU_API_ENDPOINT}/${meetingID}?password=${password}`,
      );
      set({ joinConferenceUrl: response.data, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setJoinConferenceUrl: (url) => set({ joinConferenceUrl: url }),

  updateConference: async (conference) => {
    set({ isLoading: true });
    try {
      await eduApi.patch<ConferenceDto[]>(CONFERENCES_EDU_API_ENDPOINT, conference);
      set({ selectedConference: null });
      toast.success(i18n.t('conferences.conferenceUpdatedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useConferenceDetailsDialogStore;
