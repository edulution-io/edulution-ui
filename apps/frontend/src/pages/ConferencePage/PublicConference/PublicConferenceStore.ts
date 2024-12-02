import { create, StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { CONFERENCES_PUBLIC_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

interface PublicConferenceStore {
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
  lessonData: StateCreator<PublicConferenceStore>,
  options: PersistOptions<PublicConferenceStore>,
) => StateCreator<PublicConferenceStore>;

const usePublicConferenceStore = create<PublicConferenceStore>(
  (persist as PersistentPublicConferenceStore)(
    (set, get) => ({
      ...initialState,

      reset: () => set({ ...initialState }),

      setPublicUserFullName: (publicUserFullName) => set({ publicUserFullName }),
      setStoredPasswordByMeetingId: (meetingId, password) =>
        set((state) => ({
          storedPasswordsByMeetingIds: {
            ...state.storedPasswordsByMeetingIds,
            [meetingId]: btoa(password) || '',
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
    } as PersistOptions<PublicConferenceStore>,
  ),
);

export default usePublicConferenceStore;
