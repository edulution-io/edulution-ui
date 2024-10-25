import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FrameStore {
  loadedFrames: string[];
  setFrameLoaded: (appName: string) => void;
  activeFrame: string | null;
  setActiveFrame: (frameName: string | null) => void;
  reset: () => void;
}

const initialStore = {
  loadedFrames: [],
  activeFrame: null,
};

const useFrameStore = create<FrameStore>()(
  persist(
    (set, get) => ({
      ...initialStore,
      setFrameLoaded: (appName) => {
        const { loadedFrames } = get();
        if (!loadedFrames.includes(appName)) {
          set({ loadedFrames: [...loadedFrames, appName] });
        }
      },
      setActiveFrame: (activeFrame) => set({ activeFrame }),
      reset: () => set({ ...initialStore }),
    }),
    {
      name: 'frame-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        loadedFrames: state.loadedFrames,
        activeFrame: state.activeFrame,
      }),
    },
  ),
);

export default useFrameStore;
