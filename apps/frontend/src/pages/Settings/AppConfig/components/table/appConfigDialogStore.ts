import { create } from 'zustand';

interface AppConfigDialogStore {
  isDialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

const initialState = {
  isDialogOpen: false,
};

const useAppConfigDialogStore = create<AppConfigDialogStore>((set) => ({
  ...initialState,
  setDialogOpen: (open) => set({ isDialogOpen: open }),
}));

export default useAppConfigDialogStore;
