import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import {
  LMN_API_CHANGE_PASSWORD_EDU_API_ENDPOINT,
  LMN_API_FIRST_PASSWORD_EDU_API_ENDPOINT,
} from '@libs/lmnApi/types/eduApiEndpoints';
import LmnApiStore from '@libs/lmnApi/constants/lmnApiPasswordStore';
import { toast } from 'sonner';
import i18n from '@/i18n';

const initialState = {
  isLoading: false,
  error: null,
  currentUser: null,
};

const useLmnApiPasswordStore = create<LmnApiStore>((set) => ({
  ...initialState,

  setCurrentUser(currentUser) {
    set({ currentUser });
  },

  setFirstPassword: async (username, password) => {
    set({ error: null, isLoading: true });
    try {
      const { lmnApiToken } = useLmnApiStore.getState();
      await eduApi.put(
        LMN_API_FIRST_PASSWORD_EDU_API_ENDPOINT,
        {
          username,
          password,
        },
        {
          headers: { 'x-api-key': lmnApiToken },
        },
      );
      toast.success(i18n.t('classmanagement.firstPasswordChangedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentPassword: async (username, password) => {
    set({ error: null, isLoading: true });
    try {
      const { lmnApiToken } = useLmnApiStore.getState();
      await eduApi.post(
        LMN_API_CHANGE_PASSWORD_EDU_API_ENDPOINT,
        {
          username,
          password,
        },
        {
          headers: { 'x-api-key': lmnApiToken },
        },
      );
      toast.success(i18n.t('classmanagement.currentPasswordChangedSuccessfully'));
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));

export default useLmnApiPasswordStore;
