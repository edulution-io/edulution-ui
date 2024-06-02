import { create } from 'zustand';

interface StoreStates {
  isVideoModalOpen: boolean;
  videoModalUrl: string;
  videoModalUsername: string;
  isEditModalOpen: boolean;
  editModalItem: { itemEditName: string; type: string } | null;
  isCopyModalOpen: boolean;
  copyModalItem: { itemEditName: string; type: string } | null;
  isDeleteModalOpen: boolean;
  deleteModalItem: { itemEditName: string; type: string } | null;
}

interface StoreActions {
  setIsVideoModalOpen: (isOpen: boolean) => void;
  setVideoModalUrl: (url: string) => void;
  setVideoModalUsername: (username: string) => void;
  resetVideoModal: () => void;
  setIsEditModalOpen: (isOpen: boolean, item?: { itemEditName: string; type: string }) => void;
  resetEditModal: () => void;
  setIsDeleteModalOpen: (isOpen: boolean, item?: { itemEditName: string; type: string }) => void;
  resetDeleteModal: () => void;
  setIsCopyModalOpen: (isOpen: boolean, item?: { itemEditName: string; type: string }) => void;
  resetCopyModal: () => void;
}

type Store = StoreStates & StoreActions;

const initialState: Omit<
  Store,
  | 'setIsVideoModalOpen'
  | 'setVideoModalUrl'
  | 'setVideoModalUsername'
  | 'resetVideoModal'
  | 'setIsEditModalOpen'
  | 'resetEditModal'
  | 'setIsDeleteModalOpen'
  | 'resetDeleteModal'
  | 'resetCopyModal'
  | 'setIsCopyModalOpen'
> = {
  isVideoModalOpen: false,
  videoModalUrl: '',
  videoModalUsername: '',
  isEditModalOpen: false,
  editModalItem: null,
  isDeleteModalOpen: false,
  deleteModalItem: null,
  isCopyModalOpen: false,
  copyModalItem: null,
};

const useSchoolManagementComponentStore = create<Store>((set) => ({
  ...initialState,
  setIsVideoModalOpen: (isOpen) => set({ isVideoModalOpen: isOpen }),
  setVideoModalUrl: (url) => set({ videoModalUrl: url }),
  setVideoModalUsername: (username) => set({ videoModalUsername: username }),
  resetVideoModal: () => set(initialState), // Add this method

  setIsEditModalOpen: (isOpen, item) => set({ isEditModalOpen: isOpen, editModalItem: item || null }),
  resetEditModal: () => set({ isEditModalOpen: false, editModalItem: null }),

  setIsDeleteModalOpen: (isOpen, item) => set({ isDeleteModalOpen: isOpen, deleteModalItem: item || null }),
  resetDeleteModal: () => set({ isDeleteModalOpen: false, deleteModalItem: null }),
  setIsCopyModalOpen: (isOpen, item) => set({ isCopyModalOpen: isOpen, copyModalItem: item || null }),
  resetCopyModal: () => set({ isCopyModalOpen: false, copyModalItem: null }),
}));

export default useSchoolManagementComponentStore;
