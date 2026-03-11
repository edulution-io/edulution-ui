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
import Section from '@libs/menubar/section';

interface SubMenuStore {
  sections: Section[];
  parentId: string | null;
  activeSection: string | null;
  sectionToOpen: string | null;
  setSections: (sections: Section[], parentId?: string) => void;
  setActiveSection: (id: string | null) => void;
  requestOpenSection: (id: string) => void;
  clearOpenRequest: () => void;
  reset: () => void;
}

const initialState = {
  sections: [] as Section[],
  parentId: null as string | null,
  activeSection: null as string | null,
  sectionToOpen: null as string | null,
};

const useSubMenuStore = create<SubMenuStore>((set) => ({
  ...initialState,
  setSections: (sections, parentId) => set({ sections, parentId: parentId ?? null }),
  setActiveSection: (id) => set({ activeSection: id }),
  requestOpenSection: (id) => set({ sectionToOpen: id, activeSection: id }),
  clearOpenRequest: () => set({ sectionToOpen: null }),
  reset: () => set(initialState),
}));

export default useSubMenuStore;
