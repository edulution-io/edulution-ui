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
import { RowSelectionState } from '@tanstack/react-table';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { CONFERENCES_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import { toast } from 'sonner';
import i18n from '@/i18n';

interface UseConferenceStore {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  setConferences: (conferences: ConferenceDto[]) => void;
  conferences: ConferenceDto[];
  runningConferences: ConferenceDto[];
  isLoading: boolean;
  error: Error | null;
  getConferences: (isLoading?: boolean, showToaster?: boolean) => Promise<void>;
  deleteConferences: (conferences: ConferenceDto[]) => Promise<void>;
  isDeleteConferencesDialogOpen: boolean;
  setIsDeleteConferencesDialogOpen: (isOpen: boolean) => void;
  toggleConferenceRunningState: (meetingId: string, isRunning: boolean) => Promise<boolean>;
  loadingMeetingId: string | null;
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
  loadingMeetingId: null,
  isDeleteConferencesDialogOpen: false,
};

const useConferenceStore = create<UseConferenceStore>((set, get) => ({
  ...initialValues,

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
  setConferences: (conferences: ConferenceDto[]) => {
    const runningConferences = conferences.filter((c) => c.isRunning);
    set({ conferences, runningConferences });
  },

  getConferences: async (isLoading = true, showToaster = false) => {
    set({ isLoading, error: null });
    try {
      const { data } = await eduApi.get<ConferenceDto[]>(CONFERENCES_EDU_API_ENDPOINT);

      get().setConferences(data);

      if (showToaster) {
        toast.success(i18n.t('conferences.conferenceFetchedSuccessfully'));
      }
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
  toggleConferenceRunningState: async (meetingID, isRunning) => {
    set({ loadingMeetingId: meetingID });
    toast.info(i18n.t(`conferences.is${isRunning ? 'Stopping' : 'Starting'}`));

    try {
      await eduApi.put<ConferenceDto>(CONFERENCES_EDU_API_ENDPOINT, { meetingID, isRunning });
      return true;
    } catch (error) {
      handleApiError(error, set, 'toggleConferenceRunningStateError');
      return false;
    } finally {
      setTimeout(() => {
        set({ loadingMeetingId: null });
      }, 5500);
    }
  },
  reset: () => set(initialValues),
}));

export default useConferenceStore;
