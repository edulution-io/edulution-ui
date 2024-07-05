import { create } from 'zustand';

interface SidebarStore {
  isMobileSidebarOpen: boolean;
  reset: () => void;
  toggleMobileSidebar: () => void;
}

const initialState = {
  isMobileSidebarOpen: false,
};

const useSidebarStore = create<SidebarStore>((set) => ({
  ...initialState,
  reset: () => set(initialState),
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
}));

export default useSidebarStore;
