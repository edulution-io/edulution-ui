import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FrameStore {
  loadedEmbeddedFrames: string[];
  setEmbeddedFrameLoaded: (appName: string) => void;
  activeEmbeddedFrame: string | null;
  setActiveEmbeddedFrame: (frameName: string | null) => void;

  openWindowedFrames: string[];
  setWindowedFrameOpen: (appName: string, isOpen: boolean) => void;
  minimizedWindowedFrames: string[];
  setWindowedFrameMinimized: (appName: string, isMinimized: boolean) => void;
  reset: () => void;
}

const initialStore = {
  loadedEmbeddedFrames: [],
  activeEmbeddedFrame: null,

  openWindowedFrames: [],
  minimizedWindowedFrames: [],
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
