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

import APPS from '@libs/appconfig/constants/apps';
import VIEW_MODE from '@libs/common/constants/viewMode';
import FILE_CATEGORIES from '@libs/filesharing/constants/fileCategories';
import useTableViewSettingsStore from './useTableViewSettingsStore';

const initialStoreState = useTableViewSettingsStore.getState();

describe('useTableViewSettingsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useTableViewSettingsStore.setState(initialStoreState, true);
  });

  describe('initial state', () => {
    it('has empty viewModes', () => {
      expect(useTableViewSettingsStore.getState().viewModes).toEqual({});
    });

    it('has default showSystemFiles for FILE_SHARING', () => {
      expect(useTableViewSettingsStore.getState().showSystemFiles).toEqual({
        [APPS.FILE_SHARING]: false,
      });
    });

    it('has default showHiddenFiles for FILE_SHARING', () => {
      expect(useTableViewSettingsStore.getState().showHiddenFiles).toEqual({
        [APPS.FILE_SHARING]: false,
      });
    });

    it('has default fileCategoryFilters for FILE_SHARING with all categories enabled', () => {
      const filters = useTableViewSettingsStore.getState().fileCategoryFilters[APPS.FILE_SHARING];

      expect(filters[FILE_CATEGORIES.FOLDER]).toBe(true);
      expect(filters[FILE_CATEGORIES.DOCUMENT]).toBe(true);
      expect(filters[FILE_CATEGORIES.IMAGE]).toBe(true);
      expect(filters[FILE_CATEGORIES.VIDEO]).toBe(true);
      expect(filters[FILE_CATEGORIES.AUDIO]).toBe(true);
    });
  });

  describe('setViewMode', () => {
    it('sets view mode for a given key', () => {
      useTableViewSettingsStore.getState().setViewMode('my-app', VIEW_MODE.grid);

      expect(useTableViewSettingsStore.getState().viewModes['my-app']).toBe(VIEW_MODE.grid);
    });

    it('sets view mode for multiple keys independently', () => {
      useTableViewSettingsStore.getState().setViewMode('app-a', VIEW_MODE.grid);
      useTableViewSettingsStore.getState().setViewMode('app-b', VIEW_MODE.table);

      expect(useTableViewSettingsStore.getState().viewModes['app-a']).toBe(VIEW_MODE.grid);
      expect(useTableViewSettingsStore.getState().viewModes['app-b']).toBe(VIEW_MODE.table);
    });

    it('overwrites existing view mode for same key', () => {
      useTableViewSettingsStore.getState().setViewMode('my-app', VIEW_MODE.grid);
      useTableViewSettingsStore.getState().setViewMode('my-app', VIEW_MODE.table);

      expect(useTableViewSettingsStore.getState().viewModes['my-app']).toBe(VIEW_MODE.table);
    });
  });

  describe('getViewMode', () => {
    it('returns table as default when key does not exist', () => {
      expect(useTableViewSettingsStore.getState().getViewMode('unknown-key')).toBe(VIEW_MODE.table);
    });

    it('returns the stored view mode for existing key', () => {
      useTableViewSettingsStore.getState().setViewMode('my-app', VIEW_MODE.grid);

      expect(useTableViewSettingsStore.getState().getViewMode('my-app')).toBe(VIEW_MODE.grid);
    });
  });

  describe('setShowSystemFiles', () => {
    it('sets showSystemFiles for a given key', () => {
      useTableViewSettingsStore.getState().setShowSystemFiles('my-app', true);

      expect(useTableViewSettingsStore.getState().showSystemFiles['my-app']).toBe(true);
    });

    it('preserves existing keys when setting new ones', () => {
      useTableViewSettingsStore.getState().setShowSystemFiles('my-app', true);

      expect(useTableViewSettingsStore.getState().showSystemFiles[APPS.FILE_SHARING]).toBe(false);
      expect(useTableViewSettingsStore.getState().showSystemFiles['my-app']).toBe(true);
    });
  });

  describe('setShowHiddenFiles', () => {
    it('sets showHiddenFiles for a given key', () => {
      useTableViewSettingsStore.getState().setShowHiddenFiles('my-app', true);

      expect(useTableViewSettingsStore.getState().showHiddenFiles['my-app']).toBe(true);
    });

    it('preserves existing keys when setting new ones', () => {
      useTableViewSettingsStore.getState().setShowHiddenFiles('my-app', true);

      expect(useTableViewSettingsStore.getState().showHiddenFiles[APPS.FILE_SHARING]).toBe(false);
      expect(useTableViewSettingsStore.getState().showHiddenFiles['my-app']).toBe(true);
    });
  });

  describe('setFileCategoryFilter', () => {
    it('disables a single category for an existing app key', () => {
      useTableViewSettingsStore.getState().setFileCategoryFilter(APPS.FILE_SHARING, FILE_CATEGORIES.IMAGE, false);

      const filters = useTableViewSettingsStore.getState().fileCategoryFilters[APPS.FILE_SHARING];
      expect(filters[FILE_CATEGORIES.IMAGE]).toBe(false);
      expect(filters[FILE_CATEGORIES.FOLDER]).toBe(true);
    });

    it('enables a previously disabled category', () => {
      useTableViewSettingsStore.getState().setFileCategoryFilter(APPS.FILE_SHARING, FILE_CATEGORIES.VIDEO, false);
      useTableViewSettingsStore.getState().setFileCategoryFilter(APPS.FILE_SHARING, FILE_CATEGORIES.VIDEO, true);

      const filters = useTableViewSettingsStore.getState().fileCategoryFilters[APPS.FILE_SHARING];
      expect(filters[FILE_CATEGORIES.VIDEO]).toBe(true);
    });

    it('creates default filters for unknown app key and applies the change', () => {
      useTableViewSettingsStore.getState().setFileCategoryFilter('new-app', FILE_CATEGORIES.AUDIO, false);

      const filters = useTableViewSettingsStore.getState().fileCategoryFilters['new-app'];
      expect(filters[FILE_CATEGORIES.AUDIO]).toBe(false);
      expect(filters[FILE_CATEGORIES.FOLDER]).toBe(true);
      expect(filters[FILE_CATEGORIES.DOCUMENT]).toBe(true);
    });
  });

  describe('getFileCategoryFilters', () => {
    it('returns stored filters for existing app key', () => {
      useTableViewSettingsStore.getState().setFileCategoryFilter(APPS.FILE_SHARING, FILE_CATEGORIES.IMAGE, false);

      const filters = useTableViewSettingsStore.getState().getFileCategoryFilters(APPS.FILE_SHARING);
      expect(filters[FILE_CATEGORIES.IMAGE]).toBe(false);
    });

    it('returns default filters with all categories enabled for unknown app key', () => {
      const filters = useTableViewSettingsStore.getState().getFileCategoryFilters('unknown-app');

      expect(filters[FILE_CATEGORIES.FOLDER]).toBe(true);
      expect(filters[FILE_CATEGORIES.DOCUMENT]).toBe(true);
      expect(filters[FILE_CATEGORIES.IMAGE]).toBe(true);
      expect(filters[FILE_CATEGORIES.VIDEO]).toBe(true);
      expect(filters[FILE_CATEGORIES.AUDIO]).toBe(true);
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      useTableViewSettingsStore.getState().setViewMode('my-app', VIEW_MODE.grid);
      useTableViewSettingsStore.getState().setShowSystemFiles('my-app', true);
      useTableViewSettingsStore.getState().setShowHiddenFiles('my-app', true);
      useTableViewSettingsStore.getState().setFileCategoryFilter(APPS.FILE_SHARING, FILE_CATEGORIES.IMAGE, false);

      useTableViewSettingsStore.getState().reset();

      const state = useTableViewSettingsStore.getState();
      expect(state.viewModes).toEqual({});
      expect(state.showSystemFiles).toEqual({ [APPS.FILE_SHARING]: false });
      expect(state.showHiddenFiles).toEqual({ [APPS.FILE_SHARING]: false });
      expect(state.fileCategoryFilters[APPS.FILE_SHARING][FILE_CATEGORIES.IMAGE]).toBe(true);
    });
  });
});
