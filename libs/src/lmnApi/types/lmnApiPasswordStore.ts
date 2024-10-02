import UserLmnInfo from '@libs/lmnApi/types/userInfo';

interface LmnApiStoreState {
  isLoading: boolean;
  error: Error | null;
  currentUser: UserLmnInfo | null;
}

interface LmnApiStoreActions {
  reset: () => void;
  setCurrentUser: (user: UserLmnInfo | null) => void;
  setFirstPassword: (username: string, password: string) => Promise<void>;
  setCurrentPassword: (username: string, password: string) => Promise<void>;
}

type LmnApiStore = LmnApiStoreState & LmnApiStoreActions;

export default LmnApiStore;
