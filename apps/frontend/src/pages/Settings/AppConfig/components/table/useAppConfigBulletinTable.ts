import { create } from 'zustand';
import { BulletinBoardConfigurationDto } from '@libs/bulletinBoard/type/BulletinBoardConfigurationDto';

export interface BulletinBoardTableStore {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  reset: () => void;
  getData: () => BulletinBoardConfigurationDto[];
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const initialValues = {
  isDialogOpen: false,
  isLoading: true,
};

const useAppConfigBulletinTable = create<BulletinBoardTableStore>((set) => ({
  ...initialValues,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
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
