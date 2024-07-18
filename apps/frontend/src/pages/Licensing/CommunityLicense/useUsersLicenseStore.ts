import { create } from 'zustand';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import { LICENSES_PATH } from '@libs/license/types/license-endpoints';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

export interface UsersLicenseStore {
  checkForActiveUserLicenses: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;

  wasViewedAlready: boolean;
  isOpen: boolean;
  close: () => void;

  showBanner: boolean;

  reset: () => void;
}

export const initialValues = {
  isLoading: false,
  error: null,

  wasViewedAlready: false,
  isOpen: false,

  showBanner: false,
};

const useUsersLicenseStore = create<UsersLicenseStore>((set, get) => ({
  ...(initialValues as UsersLicenseStore),

  close: () => set({ isOpen: false, wasViewedAlready: true }),

  checkForActiveUserLicenses: async () => {
    const { wasViewedAlready } = get();
    if (wasViewedAlready) {
      set({ isOpen: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<LicenseInfoDto[]>(LICENSES_PATH);
      const licenses = response.data;

      if (!licenses || licenses.length === 0) {
        set({ isOpen: true, showBanner: true });
        return;
      }

      const isActive = !!licenses.find((license) => license.isLicenseActive);
      if (!isActive) {
        set({ isOpen: true, showBanner: true });
        return;
      }

      // has an active license and the dialog must not be viewed
      set({ isOpen: false, wasViewedAlready: true });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useUsersLicenseStore;
