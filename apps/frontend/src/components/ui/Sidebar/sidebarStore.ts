import { create } from 'zustand';

interface SidebarStore {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
}

const useSidebarStore = create<SidebarStore>((set) => ({
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
}));

export default useSidebarStore;
