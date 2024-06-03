import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

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

type PersistedFrameStoreStore = (
  appConfig: StateCreator<FrameStore>,
  options: PersistOptions<FrameStore>,
) => StateCreator<FrameStore>;

const useFrameStore = create<FrameStore>(
  (persist as PersistedFrameStoreStore)(
    (set, get) => ({
      ...initialStore,
      setFrameLoaded: (appName) => {
        const { loadedFrames } = get();
        if (!loadedFrames.includes(appName)) {
          set({ loadedFrames: [...loadedFrames, appName] });
        }
      },
      setActiveFrame: (activeFrame) => set({ activeFrame: activeFrame }),
      reset: () => set({ ...initialStore }),
    }),
    {
      name: 'appConfig-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useFrameStore;
