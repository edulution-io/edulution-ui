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

import { create, StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { CONFERENCES_PUBLIC_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { encodeBase64 } from '@libs/common/utils/getBase64String';

interface UsePublicConferenceStore {
  reset: () => void;
  publicUserId: string;
  publicUserFullName: string;
  setPublicUserFullName: (publicUserFullName: string) => void;
  setStoredPasswordByMeetingId: (meetingId: string, password: string) => void;
  storedPasswordsByMeetingIds: Record<string, string>;
  isGetPublicConferenceLoading: boolean;
  getPublicConference: (meetingId?: string) => Promise<Partial<ConferenceDto> | null>;
  isGetJoinConferenceUrlLoading: boolean;
  getJoinConferenceUrl: (name: string, meetingId: string, password?: string) => Promise<void>;
  error: Error | null;
}

const initialState = {
  publicUserId: uuidv4(),
  publicUserFullName: '',
  storedPasswordsByMeetingIds: {},
  isGetJoinConferenceUrlLoading: false,
  isGetPublicConferenceLoading: false,
  error: null,
};

type PersistentPublicConferenceStore = (
  lessonData: StateCreator<UsePublicConferenceStore>,
  options: PersistOptions<UsePublicConferenceStore>,
) => StateCreator<UsePublicConferenceStore>;

const usePublicConferenceStore = create<UsePublicConferenceStore>(
  (persist as PersistentPublicConferenceStore)(
    (set, get) => ({
      ...initialState,

      reset: () => set({ ...initialState }),

      setPublicUserFullName: (publicUserFullName) => set({ publicUserFullName }),
      setStoredPasswordByMeetingId: (meetingId, password) =>
        set((state) => ({
          storedPasswordsByMeetingIds: {
            ...state.storedPasswordsByMeetingIds,
            [meetingId]: encodeBase64(password) || '',
          },
        })),
      getPublicConference: async (meetingId) => {
        if (!meetingId || get().isGetPublicConferenceLoading) return null;

        set({ isGetPublicConferenceLoading: true });
        try {
          const response = await eduApi.get<Partial<ConferenceDto> | null>(
            `${CONFERENCES_PUBLIC_EDU_API_ENDPOINT}/${meetingId}`,
          );

          return response.data;
        } catch (error) {
          handleApiError(error, set);
          return null;
        } finally {
          set({ isGetPublicConferenceLoading: false });
        }
      },

      getJoinConferenceUrl: async (name, meetingId, password) => {
        set(() => ({ isGetJoinConferenceUrlLoading: true }));

        try {
          const response = await eduApi.post<string>(`${CONFERENCES_PUBLIC_EDU_API_ENDPOINT}/`, {
            userId: get().publicUserId,
            meetingId,
            name,
            password,
          });

          window.location.href = response.data;
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isGetJoinConferenceUrlLoading: false });
        }
      },
    }),
    {
      name: 'public-conference-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        publicUserId: state.publicUserId,
        publicUserFullName: state.publicUserFullName,
        storedPasswordsByMeetingIds: state.storedPasswordsByMeetingIds,
      }),
    } as PersistOptions<UsePublicConferenceStore>,
  ),
);

export default usePublicConferenceStore;
