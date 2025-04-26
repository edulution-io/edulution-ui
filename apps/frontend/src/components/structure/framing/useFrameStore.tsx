/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
