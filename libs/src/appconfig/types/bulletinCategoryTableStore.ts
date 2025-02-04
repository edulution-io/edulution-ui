/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
  setCategoryPosition: (categoryId: string, position: number) => Promise<void>;
  isCategoryPositionLoading: boolean;
  error: null | Error;
}
