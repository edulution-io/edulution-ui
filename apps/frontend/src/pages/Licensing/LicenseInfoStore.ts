import { create } from 'zustand';
import { RowSelectionState } from '@tanstack/react-table';
import LicenseInfoDto from '@libs/license/types/license-info.dto';
import { LICENSE_MANAGEMENT_PATH } from '@libs/license/types/license-endpoints';
import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';

interface LicenseInfoStore {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  selectedLicense: LicenseInfoDto | undefined;
  setSelectedLicense: (selectedLicense: LicenseInfoDto | undefined) => void;
  licenses: LicenseInfoDto[];
  showOnlyActiveLicenses: boolean;
  setShowOnlyActiveLicenses: (showOnlyActive: boolean) => void;
  isLicenseActive: boolean;
  getLicenses: () => Promise<void>;
  removeLicense: (licenses: LicenseInfoDto[]) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

const initialValues = {
  selectedRows: {},
  selectedLicense: undefined,
  licenses: [],
  showOnlyActiveLicenses: false,
  isLicenseActive: false,
  isLoading: false,
  error: null,
};

const useLicenseInfoStore = create<LicenseInfoStore>((set) => ({
  ...initialValues,

  setSelectedRows: (selectedRows: RowSelectionState) => set({ selectedRows }),
  setShowOnlyActiveLicenses: (showOnlyActive: boolean) => set({ showOnlyActiveLicenses: showOnlyActive }),
  setSelectedLicense: (selectedLicense: LicenseInfoDto | undefined) => set({ selectedLicense }),

  getLicenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<LicenseInfoDto[]>(LICENSE_MANAGEMENT_PATH);
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
      const response = await eduApi.delete<LicenseInfoDto[]>(LICENSE_MANAGEMENT_PATH, {
        data: licenses,
      });
      set({ licenses: response.data, selectedRows: {} });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set(initialValues),
}));

export default useLicenseInfoStore;
