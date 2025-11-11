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
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { toast } from 'sonner';
import i18n from '@/i18n';
import LICENSE_ENDPOINT from '@libs/license/constants/license-endpoints';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import CommunityLicenseStore from '@libs/license/types/communityLicenseStore';
import communityLicenseStoreInitialValues from '@libs/license/constants/communityLicenseStoreInitialValues';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

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

      setIsRegisterDialogOpen: (isRegisterDialogOpen) => set({ isRegisterDialogOpen }),

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

      signLicense: async (licenseKey) => {
        set({ isLoading: true });
        try {
          const { data: licenseInfo } = await eduApi.post<LicenseInfoDto>(LICENSE_ENDPOINT, { licenseKey });
          set({ licenseInfo, isRegisterDialogOpen: false });
          toast.success(i18n.t('settings.license.licenseSignedSuccessfully'));
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
