import { create } from 'zustand';
import { LICENSE_ENDPOINT } from '@libs/license/types/license-endpoints';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import CommunityLicenseStore from '@libs/license/types/communityLicenseStore';
import communityLicenseStoreInitialValues from '@libs/license/constants/communityLicenseStoreInitialValues';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useCommunityLicenseStore = create<CommunityLicenseStore>((set, get) => ({
  ...communityLicenseStoreInitialValues,
  reset: () => set(communityLicenseStoreInitialValues),

  close: () => set({ isOpen: false, wasViewedAlready: true }),

  checkForActiveUserLicenses: async () => {
    const { isLoading, wasViewedAlready } = get();
    if (isLoading) {
      return;
    }
    if (wasViewedAlready) {
      set({ isOpen: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<LicenseInfoDto[]>(LICENSE_ENDPOINT);
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
}));

export default useCommunityLicenseStore;
