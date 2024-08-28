import { create } from 'zustand';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import useLmnApiStore from '@/store/useLmnApiStore';
import { LMN_API_CHANGE_PASSWORD_EDU_API_ENDPOINT } from '@libs/lmnApi/types/eduApiEndpoints';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import UserSettingsPageStore from '@libs/userSettings/constants/userSettingsPageStore';
import { toast } from 'sonner';
import i18n from '@/i18n';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';

const initialState = {
  isLoading: false,
  error: null,
};

const useUserSettingsPageStore = create<UserSettingsPageStore>((set) => ({
  ...initialState,

  changePassword: async (oldPassword, newPassword) => {
    set({ error: null, isLoading: true });
    try {
      const { lmnApiToken } = useLmnApiStore.getState();
      await eduApi.put<LmnApiSession>(
        LMN_API_CHANGE_PASSWORD_EDU_API_ENDPOINT,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: { [HTTP_HEADERS.XApiKey]: lmnApiToken },
        },
      );

      toast.success(i18n.t('usersettings.security.changePassword.passwordChangedSuccessfully'));
      return true;
    } catch (error) {
      handleApiError(error, set);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));
export default useUserSettingsPageStore;
