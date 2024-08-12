import { create, StateCreator } from 'zustand';
import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import CommunityLicenseStore from '@libs/license/types/communityLicenseStore';
import communityLicenseStoreInitialValues from '@libs/license/constants/communityLicenseStoreInitialValues';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

type PersistedComunityLicenseStore = (
  appConfig: StateCreator<CommunityLicenseStore>,
  options: PersistOptions<Partial<CommunityLicenseStore>>,
) => StateCreator<CommunityLicenseStore>;

const useCommunityLicenseStore = create<CommunityLicenseStore>(
  (persist as PersistedComunityLicenseStore)(
    (set, get) => ({
      ...communityLicenseStoreInitialValues,
      reset: () => set(communityLicenseStoreInitialValues),

      close: () => set({ isOpen: false, wasViewedAlready: true }),

      checkForActiveUserLicense: async () => {
        const { wasViewedAlready } = get();
        if (wasViewedAlready) {
          set({ isOpen: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await eduApi.get<LicenseInfoDto>(LICENSE_ENDPOINT);
          const licenseinfo = response.data;

          if (!licenseinfo || !licenseinfo.isLicenseActive) {
            setTimeout(() => set({ isOpen: true }), 400);
            return;
          }
          set({ isOpen: false, wasViewedAlready: true, isLicenseActive: licenseinfo.isLicenseActive });
        } catch (error) {
          handleApiError(error, set);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'license-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        wasViewedAlready: state.wasViewedAlready,
        isLicenseActive: state.isLicenseActive,
      }),
    },
  ),
);

export default useCommunityLicenseStore;
