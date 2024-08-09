import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import { LICENSE_MANAGEMENT_ENDPOINT } from '@libs/license/types/license-endpoints';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import LicenseInfoStore from '@libs/license/types/licenseInfoStore';
import licenseInfoStoreInitialValues from '@libs/license/constants/licenseInfoStoreInitialValues';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

const useLicenseInfoStore = create<LicenseInfoStore>((set, get) => ({
  ...licenseInfoStoreInitialValues,
  reset: () => set(licenseInfoStoreInitialValues),

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
  setShowOnlyActiveLicenses: (showOnlyActive: boolean) => set({ showOnlyActiveLicenses: showOnlyActive }),
  setSelectedLicense: (selectedLicense: LicenseInfoDto | undefined) => set({ selectedLicense }),

  clearSelection: () => set({ selectedLicense: undefined, selectedRows: {} }),

  getLicenses: async () => {
    const { isLoading } = get();
    if (isLoading) {
      return;
    }
    set({ isLoading: true });
    try {
      const response = await eduApi.get<LicenseInfoDto[]>(LICENSE_MANAGEMENT_ENDPOINT);
      set({ licenses: response.data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  removeLicense: async (licenses: LicenseInfoDto[]) => {
    set({ isLoading: true });
    try {
      const response = await eduApi.delete<LicenseInfoDto[]>(LICENSE_MANAGEMENT_ENDPOINT, {
        data: licenses,
      });
      set({ licenses: response.data, selectedRows: {} });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useLicenseInfoStore;
