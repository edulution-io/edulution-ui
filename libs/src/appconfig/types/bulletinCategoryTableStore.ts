import AppConfigTable from '@libs/bulletinBoard/types/appConfigTable';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';

export interface BulletinCategoryTableStore extends AppConfigTable<BulletinCategoryResponseDto> {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  addNewCategory: (category: CreateBulletinCategoryDto) => Promise<void>;
  setSelectedCategory: (category: BulletinCategoryResponseDto | null) => void;
  selectedCategory: BulletinCategoryResponseDto | null;
  checkIfNameAllReadyExists: (name: string) => Promise<void>;
  updateCategory: (id: string, category: CreateBulletinCategoryDto) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  nameExistsAlready: boolean;
  isNameCheckingLoading: boolean;
  reset: () => void;
  isDeleteDialogOpen: boolean;
  isDeleteDialogLoading: boolean;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  error: null | Error;
}
