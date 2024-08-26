import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';

interface PrintPasswordsState {
  isLoading: boolean;
  error: Error | null;
}

interface PrintPasswordsActions {
  reset: () => void;
  printPasswords: (options: PrintPasswordsRequest) => Promise<void>;
}

type PrintPasswordsStore = PrintPasswordsState & PrintPasswordsActions;

export default PrintPasswordsStore;
