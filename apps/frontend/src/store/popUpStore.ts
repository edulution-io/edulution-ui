import { create } from 'zustand';

type PopUpStore = {
  isVisible: boolean;
  isLoading: boolean;
  setPopUpVisibility: (isVisible: boolean) => void;
  setLoading: (isLoading: boolean) => void;
};

const usePopUpStore = create<PopUpStore>((set) => ({
  isVisible: false,
  isLoading: false,
  setPopUpVisibility: (isVisible: boolean) => set({ isVisible }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

export default usePopUpStore;
