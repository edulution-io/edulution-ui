import { create } from 'zustand';
import { BulletinBoardConfigurationDto } from '@libs/bulletinBoard/type/BulletinBoardConfigurationDto';

export interface BulletinBoardTableStore {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  reset: () => void;
  getData: () => BulletinBoardConfigurationDto[];
  // openCreateCategoryDialog: () => void;
}

const initialValues = {
  isDialogOpen: false,
};

const useAppConfigBulletinTable = create<BulletinBoardTableStore>((set) => ({
  ...initialValues,

  openCreateCategoryDialog: () =>
    set({
      isDialogOpen: true,
    }),
  setIsDialogOpen: (isOpen: boolean) => set({ isDialogOpen: isOpen }),
  reset: () => set(initialValues),
  getData: () => [
    {
      id: '1',
      name: 'Test',
      visibleFor: 'Test',
      editorialAccess: 'Test',
    },
  ],
}));

export default useAppConfigBulletinTable;
