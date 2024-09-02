import { create } from 'zustand';
import ShareUrlDialogStore from '@libs/common/dialogs/ShareUrlDialogStore';
import ShareUrlDialogStoreInitialState from '@libs/common/dialogs/ShareUrlDialogStoreInitialState';

const useShareUrlDialogStore = create<ShareUrlDialogStore>((set) => ({
  ...(ShareUrlDialogStoreInitialState as ShareUrlDialogStore),
  reset: () => set(ShareUrlDialogStoreInitialState),
  setIsOpen: (state: boolean) => set({ isOpen: state }),
}));

export default useShareUrlDialogStore;
