import AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';

export interface BulletinCategoryTableStore extends AppConfigTable<BulletinCategoryResponseDto> {
  isDialogOpen: boolean;
  fetchTableContent: () => Promise<void>;
  setIsDialogOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  addNewCategory: (category: CreateBulletinCategoryDto) => Promise<void>;
  setSelectedCategory: (category: BulletinCategoryResponseDto | null) => void;
  selectedCategory: BulletinCategoryResponseDto | null;
  checkIfNameAllReadyExists: (name: string) => Promise<void>;
  setEditBulletinCategoryDialogOpen: (isOpen: boolean) => void;
  isBulletinCategoryDialogOpen: boolean;
  updateCategory: (id: string, category: CreateBulletinCategoryDto) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  nameExistsAlready: boolean;
  setNameAllReadyExists: (isNameAvailable: boolean) => void;
  isNameCheckingLoading: boolean;
  setNameCheckingIsLoading: (isNameChecking: boolean) => void;
  reset: () => void;
}
