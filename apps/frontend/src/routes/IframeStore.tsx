import { create } from 'zustand';

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

const useFrameStore = create<FrameStore>((set, get) => ({
  ...initialStore,
  setFrameLoaded: (appName) => {
    const { loadedFrames } = get();
    if (!loadedFrames.includes(appName)) {
      set({ loadedFrames: [...loadedFrames, appName] });
    }
  },
  setActiveFrame: (activeFrame) => set({ activeFrame: activeFrame }),
  reset: () => set({ ...initialStore }),
}));

export default useFrameStore;
