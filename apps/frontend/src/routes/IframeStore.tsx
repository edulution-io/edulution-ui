import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

interface IframeStore {
  loadedIframes: string[];
  setFrameLoaded: (appName: string) => void;
  activeIframe: string | null;
  setActiveIframe: (iframe: string | null) => void;
  reset: () => void;
}

const initialStore = {
  loadedIframes: [],
  activeIframe: null,
};

type PersistedIframeStoreStore = (
  appConfig: StateCreator<IframeStore>,
  options: PersistOptions<IframeStore>,
) => StateCreator<IframeStore>;

const useIframeStore = create<IframeStore>(
  (persist as PersistedIframeStoreStore)(
    (set, get) => ({
      ...initialStore,
      setFrameLoaded: (appName) => {
        const { loadedIframes } = get();
        if (!loadedIframes.includes(appName)) {
          set({ loadedIframes: [...loadedIframes, appName] });
        }
      },
      setActiveIframe: (activeIframe) => set({ activeIframe }),
      reset: () => set({ ...initialStore }),
    }),
    {
      name: 'appConfig-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useIframeStore;
