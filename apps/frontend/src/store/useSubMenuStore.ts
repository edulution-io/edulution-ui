/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { create } from 'zustand';

interface SubMenuItem {
  id: string;
  label: string;
}

interface SubMenuStore {
  sections: SubMenuItem[];
  activeSection: string | null;
  sectionToOpen: string | null;
  registerSection: (section: SubMenuItem) => void;
  unregisterSection: (id: string) => void;
  setActiveSection: (id: string | null) => void;
  requestOpenSection: (id: string) => void;
  clearOpenRequest: () => void;
}

const useSubMenuStore = create<SubMenuStore>((set) => ({
  sections: [],
  activeSection: null,
  sectionToOpen: null,
  registerSection: (section) =>
    set((state) => {
      const existingIndex = state.sections.findIndex((s) => s.id === section.id);
      if (existingIndex >= 0) {
        const newSections = [...state.sections];
        newSections[existingIndex] = section;
        return { sections: newSections };
      }
      return { sections: [...state.sections, section] };
    }),
  unregisterSection: (id) =>
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== id),
    })),
  setActiveSection: (id) => set({ activeSection: id }),
  requestOpenSection: (id) => set({ sectionToOpen: id, activeSection: id }),
  clearOpenRequest: () => set({ sectionToOpen: null }),
}));

export default useSubMenuStore;
