import { create } from 'zustand';

const NOTIFICATION_TIME_INTERVAL = 3 * 60000;

interface CurrentAffairsStore {
  shouldUpdate: boolean;
  isUpdating: boolean;

  start: () => void;
  finish: () => void;

  reset: () => void;
}

const initialState: Partial<CurrentAffairsStore> = {
  shouldUpdate: true,
  isUpdating: false,
};

const useCurrentAffairsStore = create<CurrentAffairsStore>((set /* , get */) => ({
  ...(initialState as CurrentAffairsStore),
  reset: () => set(initialState),

  start: () => set({ shouldUpdate: false, isUpdating: true }),
  finish: async () => {
    set({ isUpdating: false });
    setTimeout(() => set({ shouldUpdate: true }), NOTIFICATION_TIME_INTERVAL);
  },
}));

export default useCurrentAffairsStore;
