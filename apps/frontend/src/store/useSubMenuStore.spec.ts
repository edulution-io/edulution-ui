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

import type Section from '@libs/menubar/section';
import useSubMenuStore from './useSubMenuStore';

const mockSections: Section[] = [
  { id: 'section-1', label: 'Section One' },
  { id: 'section-2', label: 'Section Two' },
  { id: 'section-3', label: 'Section Three', action: vi.fn() },
];

const initialStoreState = useSubMenuStore.getState();

describe('useSubMenuStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useSubMenuStore.setState(initialStoreState, true);
  });

  describe('initial state', () => {
    it('has empty sections array', () => {
      expect(useSubMenuStore.getState().sections).toEqual([]);
    });

    it('has null parentId', () => {
      expect(useSubMenuStore.getState().parentId).toBeNull();
    });

    it('has null activeSection', () => {
      expect(useSubMenuStore.getState().activeSection).toBeNull();
    });

    it('has null sectionToOpen', () => {
      expect(useSubMenuStore.getState().sectionToOpen).toBeNull();
    });
  });

  describe('setSections', () => {
    it('sets sections and defaults parentId to null', () => {
      useSubMenuStore.getState().setSections(mockSections);

      expect(useSubMenuStore.getState().sections).toEqual(mockSections);
      expect(useSubMenuStore.getState().parentId).toBeNull();
    });

    it('sets sections with a parentId', () => {
      useSubMenuStore.getState().setSections(mockSections, 'parent-1');

      expect(useSubMenuStore.getState().sections).toEqual(mockSections);
      expect(useSubMenuStore.getState().parentId).toBe('parent-1');
    });

    it('replaces existing sections', () => {
      useSubMenuStore.getState().setSections(mockSections, 'parent-1');

      const newSections: Section[] = [{ id: 'new-1', label: 'New Section' }];
      useSubMenuStore.getState().setSections(newSections);

      expect(useSubMenuStore.getState().sections).toEqual(newSections);
      expect(useSubMenuStore.getState().parentId).toBeNull();
    });
  });

  describe('setActiveSection', () => {
    it('sets activeSection to a given id', () => {
      useSubMenuStore.getState().setActiveSection('section-1');

      expect(useSubMenuStore.getState().activeSection).toBe('section-1');
    });

    it('sets activeSection to null', () => {
      useSubMenuStore.setState({ activeSection: 'section-1' });

      useSubMenuStore.getState().setActiveSection(null);

      expect(useSubMenuStore.getState().activeSection).toBeNull();
    });
  });

  describe('requestOpenSection', () => {
    it('sets sectionToOpen and activeSection', () => {
      useSubMenuStore.getState().requestOpenSection('section-2');

      expect(useSubMenuStore.getState().sectionToOpen).toBe('section-2');
      expect(useSubMenuStore.getState().activeSection).toBe('section-2');
    });
  });

  describe('clearOpenRequest', () => {
    it('clears sectionToOpen to null', () => {
      useSubMenuStore.setState({ sectionToOpen: 'section-1' });

      useSubMenuStore.getState().clearOpenRequest();

      expect(useSubMenuStore.getState().sectionToOpen).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      useSubMenuStore.setState({
        sections: mockSections,
        parentId: 'parent-1',
        activeSection: 'section-1',
        sectionToOpen: 'section-2',
      });

      useSubMenuStore.getState().reset();

      const state = useSubMenuStore.getState();
      expect(state.sections).toEqual([]);
      expect(state.parentId).toBeNull();
      expect(state.activeSection).toBeNull();
      expect(state.sectionToOpen).toBeNull();
    });
  });
});
