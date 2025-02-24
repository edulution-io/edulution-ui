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

import { create, StateCreator } from 'zustand';
import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import CommunityLicenseStore from '@libs/license/types/communityLicenseStore';
import communityLicenseStoreInitialValues from '@libs/license/constants/communityLicenseStoreInitialValues';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

type PersistedCommunityLicenseStore = (
  licenseData: StateCreator<CommunityLicenseStore>,
  options: PersistOptions<Partial<CommunityLicenseStore>>,
) => StateCreator<CommunityLicenseStore>;

const useCommunityLicenseStore = create<CommunityLicenseStore>(
  (persist as PersistedCommunityLicenseStore)(
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
          const { data: licenseInfo } = await eduApi.get<LicenseInfoDto>(LICENSE_ENDPOINT);
          set({ licenseInfo });
          if (!licenseInfo || !licenseInfo.isLicenseActive) {
            setTimeout(() => set({ isOpen: true }), 400);
            return;
          }
          set({ isOpen: false, wasViewedAlready: true });
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
        licenseInfo: state.licenseInfo,
      }),
    },
  ),
);

export default useCommunityLicenseStore;
