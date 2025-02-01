import { create } from 'zustand';

interface AppConfigTableDialogStore {
  isDialogOpen: string;
  setDialogOpen: (open: string) => void;
}

const initialState = {
  isDialogOpen: '',
};

const useAppConfigTableDialogStore = create<AppConfigTableDialogStore>((set) => ({
  ...initialState,
  setDialogOpen: (open) => set({ isDialogOpen: open }),
}));

export default useAppConfigTableDialogStore;
