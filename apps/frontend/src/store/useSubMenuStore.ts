import { create } from 'zustand';
import SubMenuItem from '@libs/menubar/subMenuItem';

interface SubMenuStore {
  sections: SubMenuItem[];
  activeSection: string | null;
  registerSection: (section: SubMenuItem) => void;
  unregisterSection: (id: string) => void;
  setActiveSection: (id: string | null) => void;
  clearSections: () => void;
}

const initialState = {
  sections: [],
  activeSection: null,
};

const useSubMenuStore = create<SubMenuStore>((set) => ({
  ...initialState,
  registerSection: (section) =>
    set((state) => {
      if (state.sections.some((s) => s.id === section.id)) return state;
      return { sections: [...state.sections, section] };
    }),
  unregisterSection: (id) =>
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== id),
    })),
  setActiveSection: (id) => set({ activeSection: id }),
  clearSections: () => set({ sections: [], activeSection: null }),
}));

export default useSubMenuStore;
