import { create } from 'zustand';

const NOTIFICATION_TIME_INTERVALL = 36000;

interface CurrentAffairsStore {
  shouldUpdate: boolean;
  isUpdating: boolean;
  lastUpdated: Date;
  startUpdating: () => void;
  finishUpdating: () => void;
  checkIsUpdateNeeded: () => boolean;

  reset: () => void;
}

const initialState: Partial<CurrentAffairsStore> = {
  shouldUpdate: true,
  isUpdating: false,
  lastUpdated: new Date(),
};

const useCurrentAffairsStore = create<CurrentAffairsStore>((set, get) => ({
  ...(initialState as CurrentAffairsStore),
  reset: () => set(initialState),

  startUpdating: () => set({ isUpdating: true }),
  finishUpdating: () => set({ isUpdating: false, lastUpdated: new Date() }),
  checkIsUpdateNeeded: () => {
    const { isUpdating, lastUpdated } = get();
    if (isUpdating) {
      set({ shouldUpdate: false });
      return false;
    };
    const now = new Date();
    const elapsedTime = now.getTime() - lastUpdated.getTime();
    if (elapsedTime < NOTIFICATION_TIME_INTERVALL) {
      set({ shouldUpdate: false });
      return false;
    }
    set({ shouldUpdate: true });
    return true;
  },
}));

export default useCurrentAffairsStore;
