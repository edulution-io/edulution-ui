import CreateBulletinCategoryDto from '@libs/bulletinBoard/type/createBulletinCategoryDto';
import { IsDate, IsMongoId, IsOptional } from 'class-validator';

class BulletinCategoryResponseDto extends CreateBulletinCategoryDto {
  @IsMongoId()
  id: string;

  @IsDate()
  @IsOptional()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export default BulletinCategoryResponseDto;
