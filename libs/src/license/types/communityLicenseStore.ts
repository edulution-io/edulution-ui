interface CommunityLicenseStore {
  isLoading: boolean;
  error: Error | null;
  isLicenseActive: boolean;
  wasViewedAlready: boolean;
  isOpen: boolean;
  checkForActiveUserLicense: () => Promise<void>;
  close: () => void;
  reset: () => void;
}

export default CommunityLicenseStore;
