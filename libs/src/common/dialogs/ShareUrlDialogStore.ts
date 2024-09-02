interface ShareUrlDialogStore {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
  reset: () => void;
}

export default ShareUrlDialogStore;
