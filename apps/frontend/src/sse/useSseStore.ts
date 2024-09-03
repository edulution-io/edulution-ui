import { create } from 'zustand';
import createFileSharingSseStore from '@/sse/modules/fileSharingSseStore';

type CombinedState = ReturnType<typeof createFileSharingSseStore>;

const useCombinedSSeStore = create<CombinedState>((set, get, api) => ({
  ...createFileSharingSseStore(set, get, api),
}));

export default useCombinedSSeStore;
