import { create } from 'zustand';
import { MemberInfo } from '@/datatypes/schoolclassInfo.ts';

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
  membersOfOpenGroup: MemberInfo[];
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
  setMembersOfOpenGroup: (members: MemberInfo[]) => void;
  removeNonSelectedMembers: (selectedMembers: MemberInfo[]) => void;
  getPermissionForUser: (userId: string) => MemberInfo | undefined;
  setPermissionsForUser: (userId: string, permissions: Partial<MemberInfo>) => void;
  setPermissionsForAllUsers: (permissions: Partial<MemberInfo>) => void;
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
  | 'setMembersOfOpenGroup'
  | 'removeNonSelectedMembers'
  | 'getPermissionForUser'
  | 'setPermissionsForUser'
  | 'setPermissionsForAllUsers'
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
  membersOfOpenGroup: [],
};

const useSchoolManagementComponentStore = create<Store>((set, get) => ({
  ...initialState,
  setIsVideoModalOpen: (isOpen) => set({ isVideoModalOpen: isOpen }),
  setVideoModalUrl: (url) => set({ videoModalUrl: url }),
  setVideoModalUsername: (username) => set({ videoModalUsername: username }),
  resetVideoModal: () => set(initialState),

  setIsEditModalOpen: (isOpen, item) => set({ isEditModalOpen: isOpen, editModalItem: item || null }),
  resetEditModal: () => set({ isEditModalOpen: false, editModalItem: null }),

  setIsDeleteModalOpen: (isOpen, item) => set({ isDeleteModalOpen: isOpen, deleteModalItem: item || null }),
  resetDeleteModal: () => set({ isDeleteModalOpen: false, deleteModalItem: null }),

  setIsCopyModalOpen: (isOpen, item) => set({ isCopyModalOpen: isOpen, copyModalItem: item || null }),
  resetCopyModal: () => set({ isCopyModalOpen: false, copyModalItem: null }),

  setMembersOfOpenGroup: (members) => set({ membersOfOpenGroup: members }),

  removeNonSelectedMembers: (selectedMembers) =>
    set((state) => ({
      membersOfOpenGroup: state.membersOfOpenGroup.filter((member) =>
        selectedMembers.some((selected) => selected.id === member.id),
      ),
    })),

  getPermissionForUser: (userId) => {
    const state = get();
    return state.membersOfOpenGroup.find((member) => member.id === userId);
  },

  setPermissionsForUser: (userId, permissions) =>
    set((state) => ({
      membersOfOpenGroup: state.membersOfOpenGroup.map((member) =>
        member.id === userId ? { ...member, ...permissions } : member,
      ),
    })),

  setPermissionsForAllUsers: (permissions) =>
    set((state) => ({
      membersOfOpenGroup: state.membersOfOpenGroup.map((member) => ({ ...member, ...permissions })),
    })),
}));

export default useSchoolManagementComponentStore;
