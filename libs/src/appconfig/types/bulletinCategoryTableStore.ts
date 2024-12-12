import AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';

export interface BulletinCategoryTableStore extends AppConfigTable<BulletinCategoryResponseDto> {
  isDialogOpen: boolean;
  fetchTableContent: () => Promise<BulletinCategoryResponseDto[]>;
  setIsDialogOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  addNewCategory: (category: CreateBulletinCategoryDto) => Promise<void>;
  setSelectedCategory: (category: BulletinCategoryResponseDto | null) => void;
  selectedCategory: BulletinCategoryResponseDto | null;
  checkIfNameExists: (name: string) => Promise<boolean>;
  setEditBulletinCategoryDialogOpen: (isOpen: boolean) => void;
  isBulletinCategoryDialogOpen: boolean;
  updateCategory: (id: string, category: CreateBulletinCategoryDto) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  nameExistsAlready: boolean | null;
  setNameExists: (isNameAvailable: boolean | null) => void;
  isNameChecking: boolean;
  setIsNameChecking: (isNameChecking: boolean) => void;
  reset: () => void;
}
