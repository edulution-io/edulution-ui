interface CommunityLicenseStore {
  checkForActiveUserLicenses: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;

  wasViewedAlready: boolean;
  isOpen: boolean;
  close: () => void;

  showBanner: boolean;

  reset: () => void;
}

export default CommunityLicenseStore;
