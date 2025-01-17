import { create } from 'zustand';

interface AppConfigTableDialogStore {
  isDialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

const initialState = {
  isDialogOpen: false,
};

const useAppConfigTableDialogStore = create<AppConfigTableDialogStore>((set) => ({
  ...initialState,
  setDialogOpen: (open) => set({ isDialogOpen: open }),
}));

export default useAppConfigTableDialogStore;
