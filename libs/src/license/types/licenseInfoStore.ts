import { RowSelectionState } from '@tanstack/react-table';
import LicenseInfoDto from '@libs/license/types/license-info.dto';

interface LicenseInfoStore {
  selectedRows: RowSelectionState;
  setSelectedRows: (selectedRows: RowSelectionState) => void;
  selectedLicense: LicenseInfoDto | undefined;
  setSelectedLicense: (selectedLicense: LicenseInfoDto | undefined) => void;
  clearSelection: () => void;
  licenses: LicenseInfoDto[];
  showOnlyActiveLicenses: boolean;
  setShowOnlyActiveLicenses: (showOnlyActive: boolean) => void;
  isLicenseActive: boolean;
  getLicenses: () => Promise<void>;
  removeLicense: (licenses: LicenseInfoDto[]) => Promise<void>;
  isLoading: boolean;
  reset: () => void;
}

export default LicenseInfoStore;
