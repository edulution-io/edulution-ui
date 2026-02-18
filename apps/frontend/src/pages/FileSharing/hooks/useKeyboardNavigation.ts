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

import { RefObject, useCallback, useEffect, useState } from 'react';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import isValidFileToPreview from '@libs/filesharing/utils/isValidFileToPreview';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';

const RESIZE_DEBOUNCE_MS = 100;

interface UseKeyboardNavigationOptions {
  files: DirectoryFileDTO[];
  onFileOpen: (file: DirectoryFileDTO) => void;
  isEnabled?: boolean;
  isGridView?: boolean;
  containerRef?: RefObject<HTMLDivElement | null>;
}

const useKeyboardNavigation = ({
  files,
  onFileOpen,
  isEnabled = true,
  isGridView = false,
  containerRef,
}: UseKeyboardNavigationOptions) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isKeyboardNavActive, setIsKeyboardNavActive] = useState(false);
  const [gridItemsPerRow, setGridItemsPerRow] = useState(1);

  const { isFilePreviewVisible, setIsFilePreviewVisible, currentlyEditingFile, resetCurrentlyEditingFile } =
    useFileEditorStore();

  const focusedFile =
    focusedIndex !== null && focusedIndex >= 0 && focusedIndex < files.length ? files[focusedIndex] : null;

  const resetNavigation = useCallback(() => {
    setFocusedIndex(null);
    setIsKeyboardNavActive(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled || files.length === 0) return;

      const target = event.target as HTMLElement;
      const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isInputElement) return;

      const findCurrentFileIndex = () => {
        if (currentlyEditingFile) {
          const index = files.findIndex((f) => f.filePath === currentlyEditingFile.filePath);
          if (index !== -1) return index;
        }
        return null;
      };

      const navigateByStep = (step: number) => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        setIsKeyboardNavActive(true);
        setFocusedIndex((prev) => {
          if (prev === null) {
            const currentIndex = findCurrentFileIndex();
            if (currentIndex !== null) {
              const newIndex = currentIndex + step;
              return Math.max(0, Math.min(newIndex, files.length - 1));
            }
            return step > 0 ? 0 : files.length - 1;
          }
          const newIndex = prev + step;
          return Math.max(0, Math.min(newIndex, files.length - 1));
        });
      };

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          navigateByStep(isGridView ? gridItemsPerRow : 1);
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          navigateByStep(isGridView ? -gridItemsPerRow : -1);
          break;
        }
        case 'ArrowRight': {
          if (isGridView) {
            event.preventDefault();
            navigateByStep(1);
          }
          break;
        }
        case 'ArrowLeft': {
          if (isGridView) {
            event.preventDefault();
            navigateByStep(-1);
          }
          break;
        }
        case 'Enter': {
          if (focusedFile) {
            event.preventDefault();
            onFileOpen(focusedFile);
          } else if (!isFilePreviewVisible && currentlyEditingFile) {
            event.preventDefault();
            setIsFilePreviewVisible(true);
          }
          break;
        }
        case 'Escape': {
          if (isFilePreviewVisible) {
            event.preventDefault();
            setIsFilePreviewVisible(false);
          } else if (isKeyboardNavActive) {
            event.preventDefault();
            resetNavigation();
          }
          break;
        }
        default:
          break;
      }
    },
    [
      isEnabled,
      files,
      focusedFile,
      onFileOpen,
      isFilePreviewVisible,
      currentlyEditingFile,
      setIsFilePreviewVisible,
      isKeyboardNavActive,
      resetNavigation,
      isGridView,
      gridItemsPerRow,
    ],
  );

  useEffect(() => {
    if (!isEnabled) return undefined;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnabled, handleKeyDown]);

  useEffect(() => {
    if (!isEnabled || !isKeyboardNavActive || focusedIndex === null) return;

    const file = files[focusedIndex];
    if (!file) return;

    if (isFilePreviewVisible && isValidFileToPreview(file)) {
      void resetCurrentlyEditingFile(file);
    }
  }, [focusedIndex, files, isEnabled, isKeyboardNavActive, isFilePreviewVisible, resetCurrentlyEditingFile]);

  useEffect(() => {
    if (!isKeyboardNavActive || !focusedFile || !containerRef?.current) return;

    const selector = `[data-row-id="${focusedFile.filePath}"]`;
    const element = containerRef.current.querySelector(selector);
    element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusedFile, isKeyboardNavActive, containerRef]);

  useEffect(() => {
    if (!containerRef?.current) return undefined;

    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);

      debounceTimeout = setTimeout(() => {
        if (isGridView && containerRef.current) {
          const gridItems = containerRef.current.querySelectorAll('[data-row-id]');
          if (gridItems.length > 0) {
            const firstItemTop = (gridItems[0] as HTMLElement).offsetTop;
            const itemsInFirstRow = Array.from(gridItems).findIndex(
              (item) => (item as HTMLElement).offsetTop !== firstItemTop,
            );
            setGridItemsPerRow(Math.max(1, itemsInFirstRow === -1 ? gridItems.length : itemsInFirstRow));
          }
        }

        if (focusedFile && containerRef.current) {
          const selector = `[data-row-id="${focusedFile.filePath}"]`;
          const element = containerRef.current.querySelector(selector);
          element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }, RESIZE_DEBOUNCE_MS);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      resizeObserver.disconnect();
    };
  }, [containerRef, isGridView, focusedFile, files.length]);

  useEffect(() => {
    setFocusedIndex(null);
    setIsKeyboardNavActive(false);
  }, [files]);

  const handleItemClick = useCallback(
    (file: DirectoryFileDTO) => {
      const index = files.findIndex((f) => f.filePath === file.filePath);
      if (index !== -1) {
        setFocusedIndex(index);
      }
      setIsKeyboardNavActive(false);
      onFileOpen(file);
    },
    [files, onFileOpen],
  );

  return {
    focusedIndex,
    focusedFile,
    isKeyboardNavActive,
    resetNavigation,
    handleItemClick,
  };
};

export default useKeyboardNavigation;
