import { create } from 'zustand';

interface SidebarStore {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
}

const useSidebarStore = create<SidebarStore>((set, get) => ({
  isMobileSidebarOpen: false,

  toggleMobileSidebar: () => {
    set({ isMobileSidebarOpen: !get().isMobileSidebarOpen });
  },
}));

export default useSidebarStore;
