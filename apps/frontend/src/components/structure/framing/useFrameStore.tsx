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
import { createJSONStorage, persist } from 'zustand/middleware';
import RectangleSize from '@libs/ui/types/rectangleSize';

interface FrameStore {
  loadedEmbeddedFrames: string[];
  setEmbeddedFrameLoaded: (appName: string) => void;
  activeEmbeddedFrame: string | null;
  setActiveEmbeddedFrame: (frameName: string | null) => void;

  openWindowedFrames: string[];
  setWindowedFrameOpen: (appName: string, isOpen: boolean) => void;
  minimizedWindowedFrames: string[];
  setWindowedFrameMinimized: (appName: string, isMinimized: boolean) => void;
  currentWindowedFrameSizes: { [appName: string]: RectangleSize | undefined };
  setCurrentWindowedFrameSize: (appName: string, size?: RectangleSize) => void;
  windowedFramesZIndices: { [appName: string]: number };
  setWindowedFramesZIndices: (appName: string) => void;
  hasFramedWindowHighestZIndex: (appName: string) => boolean;
  reset: () => void;
}

const initialStore = {
  loadedEmbeddedFrames: [],
  activeEmbeddedFrame: null,

  openWindowedFrames: [],
  minimizedWindowedFrames: [],
  currentWindowedFrameSizes: {},
  windowedFramesZIndices: { default: 0 },
};

const useFrameStore = create<FrameStore>()(
  persist(
    (set, get) => ({
      ...initialStore,

      setEmbeddedFrameLoaded: (appName) => {
        const { loadedEmbeddedFrames } = get();
        if (!loadedEmbeddedFrames.includes(appName)) {
          set({ loadedEmbeddedFrames: [...loadedEmbeddedFrames, appName] });
        }
      },
      setActiveEmbeddedFrame: (activeEmbeddedFrame) => set({ activeEmbeddedFrame }),

      setWindowedFrameOpen: (appName, isOpen) => {
        set((state) => ({
          openWindowedFrames: isOpen
            ? [...state.openWindowedFrames, appName].filter((frame, index, self) => self.indexOf(frame) === index)
            : state.openWindowedFrames.filter((frame) => frame !== appName),
        }));
      },

      setWindowedFrameMinimized: (appName, isMinimized) => {
        set((state) => ({
          minimizedWindowedFrames: isMinimized
            ? [...state.minimizedWindowedFrames, appName].sort()
            : state.minimizedWindowedFrames.filter((frame) => frame !== appName).sort(),
        }));
      },

      setCurrentWindowedFrameSize: (appName, currentWindowedFrameSize) =>
        set({ currentWindowedFrameSizes: { ...get().currentWindowedFrameSizes, [appName]: currentWindowedFrameSize } }),

      setWindowedFramesZIndices: (appName) => {
        const currentIndices = get().windowedFramesZIndices;
        const highestZIndex = Math.max(...Object.values(currentIndices));
        set({ windowedFramesZIndices: { ...currentIndices, [appName]: highestZIndex + 1 } });
      },

      hasFramedWindowHighestZIndex: (appName) => {
        const [highestAppName] = Object.entries(get().windowedFramesZIndices).reduce(
          (highest, [id, zIndex]) => (zIndex > highest[1] ? [id, zIndex] : highest),
          [null, 0] as [string | null, number],
        );

        return highestAppName === appName;
      },

      reset: () => set({ ...initialStore }),
    }),
    {
      name: 'frame-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        loadedEmbeddedFrames: state.loadedEmbeddedFrames,
        activeEmbeddedFrame: state.activeEmbeddedFrame,
      }),
    },
  ),
);

export default useFrameStore;
