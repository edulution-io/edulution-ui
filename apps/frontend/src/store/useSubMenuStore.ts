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
  sectionsByParent: Record<string, Section[]>;
  parentId: string | null;
  activeSection: string | null;
  sectionToOpen: string | null;
  searchTerm: string;
  setSections: (sections: Section[], parentId?: string) => void;
  setSectionsByParent: (sectionsByParent: Record<string, Section[]>) => void;
  setActiveSection: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  requestOpenSection: (id: string) => void;
  clearOpenRequest: () => void;
}

const useSubMenuStore = create<SubMenuStore>((set) => ({
  sections: [],
  sectionsByParent: {},
  parentId: null,
  activeSection: null,
  sectionToOpen: null,
  searchTerm: '',
  setSections: (sections, parentId) => set({ sections, parentId: parentId ?? null, searchTerm: '' }),
  setSectionsByParent: (sectionsByParent) => set({ sectionsByParent }),
  setActiveSection: (id) => set({ activeSection: id }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  requestOpenSection: (id) => set({ sectionToOpen: id, activeSection: id }),
  clearOpenRequest: () => set({ sectionToOpen: null }),
}));

export default useSubMenuStore;
