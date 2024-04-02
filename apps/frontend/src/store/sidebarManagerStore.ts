import { create } from 'zustand';

type SidebarManagerStore = {
  isSidebarCollapsed: boolean;
  isSidebarFixed: boolean;
  isMenuBarOpen: boolean;
  setIsSidebarCollapsed: (isCollapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setIsMenuBarOpen: (isOpen: boolean) => void;
  toggleMenuBarOpen: () => void;
};

const useSidebarManagerStore = create<SidebarManagerStore>((set) => ({
  isSidebarCollapsed: false,
  isSidebarFixed: false,
  isMenuBarOpen: false,
  setIsSidebarCollapsed: (isCollapsed) => set(() => ({ isSidebarCollapsed: isCollapsed })),
  toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setIsMenuBarOpen: (isOpen) => set(() => ({ isMenuBarOpen: isOpen })),
  toggleMenuBarOpen: () => set((state) => ({ isMenuBarOpen: !state.isMenuBarOpen })),
}));

export default useSidebarManagerStore;
