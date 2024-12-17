import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';

type BulletinsByCategories = {
  category: BulletinCategoryResponseDto;
  bulletins: BulletinResponseDto[];
  canEditCategory: boolean;
}[];

export default BulletinsByCategories;
