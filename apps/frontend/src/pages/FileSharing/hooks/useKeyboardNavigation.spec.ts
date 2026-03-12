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

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));
vi.mock('@libs/filesharing/utils/isValidFileToPreview', () => ({ default: () => true }));

import { renderHook, act } from '@testing-library/react';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import useKeyboardNavigation from './useKeyboardNavigation';

const createFile = (name: string): DirectoryFileDTO => ({
  filename: name,
  filePath: `/${name}`,
  etag: `etag-${name}`,
});

const fireKey = (key: string) => {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });
};

describe('useKeyboardNavigation', () => {
  const files = [createFile('file1.txt'), createFile('file2.txt'), createFile('file3.txt')];
  const onFileOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useFileEditorStore.setState({
      isFilePreviewVisible: false,
      currentlyEditingFile: null,
    });
  });

  it('starts with null focusedIndex and inactive keyboard nav', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

    expect(result.current.focusedIndex).toBeNull();
    expect(result.current.focusedFile).toBeNull();
    expect(result.current.isKeyboardNavActive).toBe(false);
  });

  describe('ArrowDown in list view', () => {
    it('sets focusedIndex to 0 on first press and activates keyboard nav', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      fireKey('ArrowDown');

      expect(result.current.focusedIndex).toBe(0);
      expect(result.current.isKeyboardNavActive).toBe(true);
    });

    it('increments focusedIndex by 1', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      fireKey('ArrowDown');
      fireKey('ArrowDown');

      expect(result.current.focusedIndex).toBe(1);
    });

    it('clamps at last index', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      fireKey('ArrowDown');
      fireKey('ArrowDown');
      fireKey('ArrowDown');
      fireKey('ArrowDown');
      fireKey('ArrowDown');

      expect(result.current.focusedIndex).toBe(2);
    });
  });

  describe('ArrowUp in list view', () => {
    it('decrements focusedIndex by 1', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      fireKey('ArrowDown');
      fireKey('ArrowDown');
      fireKey('ArrowDown');
      fireKey('ArrowUp');

      expect(result.current.focusedIndex).toBe(1);
    });

    it('clamps at 0', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      fireKey('ArrowDown');
      fireKey('ArrowUp');
      fireKey('ArrowUp');

      expect(result.current.focusedIndex).toBe(0);
    });
  });

  describe('Enter key', () => {
    it('calls onFileOpen with focused file', () => {
      renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      fireKey('ArrowDown');
      fireKey('Enter');

      expect(onFileOpen).toHaveBeenCalledWith(files[0]);
    });

    it('does nothing when no file is focused', () => {
      renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      fireKey('Enter');

      expect(onFileOpen).not.toHaveBeenCalled();
    });
  });

  describe('Escape key', () => {
    it('resets navigation when keyboard nav is active', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      fireKey('ArrowDown');
      expect(result.current.isKeyboardNavActive).toBe(true);

      fireKey('Escape');

      expect(result.current.focusedIndex).toBeNull();
      expect(result.current.isKeyboardNavActive).toBe(false);
    });

    it('closes file preview when file preview is visible', () => {
      useFileEditorStore.setState({ isFilePreviewVisible: true });
      const setIsFilePreviewVisible = vi.fn();
      useFileEditorStore.setState({ setIsFilePreviewVisible });

      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      fireKey('ArrowDown');
      fireKey('Escape');

      expect(setIsFilePreviewVisible).toHaveBeenCalledWith(false);
      expect(result.current.isKeyboardNavActive).toBe(true);
    });
  });

  describe('grid view navigation', () => {
    it('ArrowRight navigates by 1 in grid view', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen, isGridView: true }));

      fireKey('ArrowRight');

      expect(result.current.focusedIndex).toBe(0);
      expect(result.current.isKeyboardNavActive).toBe(true);

      fireKey('ArrowRight');

      expect(result.current.focusedIndex).toBe(1);
    });

    it('ArrowLeft navigates by -1 in grid view', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen, isGridView: true }));

      fireKey('ArrowRight');
      fireKey('ArrowRight');
      fireKey('ArrowLeft');

      expect(result.current.focusedIndex).toBe(0);
    });

    it('ArrowRight and ArrowLeft do nothing in list view', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen, isGridView: false }));

      fireKey('ArrowRight');

      expect(result.current.focusedIndex).toBeNull();
      expect(result.current.isKeyboardNavActive).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('does not respond to keys when isEnabled is false', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen, isEnabled: false }));

      fireKey('ArrowDown');

      expect(result.current.focusedIndex).toBeNull();
      expect(result.current.isKeyboardNavActive).toBe(false);
    });
  });

  describe('input element guard', () => {
    it('ignores keyboard events when target is an input element', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      act(() => {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });

      expect(result.current.focusedIndex).toBeNull();

      document.body.removeChild(input);
    });
  });

  describe('handleItemClick', () => {
    it('sets focusedIndex to file index and calls onFileOpen', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      act(() => {
        result.current.handleItemClick(files[1]);
      });

      expect(result.current.focusedIndex).toBe(1);
      expect(result.current.isKeyboardNavActive).toBe(false);
      expect(onFileOpen).toHaveBeenCalledWith(files[1]);
    });
  });

  describe('resetNavigation', () => {
    it('resets focusedIndex and isKeyboardNavActive', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      fireKey('ArrowDown');
      expect(result.current.isKeyboardNavActive).toBe(true);

      act(() => {
        result.current.resetNavigation();
      });

      expect(result.current.focusedIndex).toBeNull();
      expect(result.current.isKeyboardNavActive).toBe(false);
    });
  });

  describe('focusedFile', () => {
    it('returns the file at focusedIndex', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      fireKey('ArrowDown');
      fireKey('ArrowDown');

      expect(result.current.focusedFile).toEqual(files[1]);
    });

    it('returns null when focusedIndex is null', () => {
      const { result } = renderHook(() => useKeyboardNavigation({ files, onFileOpen }));

      expect(result.current.focusedFile).toBeNull();
    });
  });

  describe('files change resets navigation', () => {
    it('resets focusedIndex when files change', () => {
      const { result, rerender } = renderHook(
        ({ fileList }: { fileList: DirectoryFileDTO[] }) => useKeyboardNavigation({ files: fileList, onFileOpen }),
        { initialProps: { fileList: files } },
      );

      fireKey('ArrowDown');
      expect(result.current.focusedIndex).toBe(0);

      const newFiles = [createFile('new-file.txt')];
      rerender({ fileList: newFiles });

      expect(result.current.focusedIndex).toBeNull();
      expect(result.current.isKeyboardNavActive).toBe(false);
    });
  });
});
