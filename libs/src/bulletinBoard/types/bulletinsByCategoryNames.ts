import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';

type BulletinsByCategoryNames = {
  [categoryName: string]: BulletinResponseDto[];
};

export default BulletinsByCategoryNames;
