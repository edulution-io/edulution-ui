import { create } from 'zustand';

interface AppConfigDialogStore {
  isAddEntityDialogOpen: boolean;
  isUpdateDeleteEntityDialogOpen: boolean;
  setAddEntityDialogOpen: (open: boolean) => void;
  setUpdateDeleteEntityDialogOpen: (open: boolean) => void;
}

const initialState = {
  isAddEntityDialogOpen: false,
  isUpdateDeleteEntityDialogOpen: false,
};

const useAppConfigDialogStore = create<AppConfigDialogStore>((set) => ({
  ...initialState,
  setAddEntityDialogOpen: (open) => set({ isAddEntityDialogOpen: open }),
  setUpdateDeleteEntityDialogOpen: (open) => set({ isUpdateDeleteEntityDialogOpen: open }),
}));

export default useAppConfigDialogStore;
