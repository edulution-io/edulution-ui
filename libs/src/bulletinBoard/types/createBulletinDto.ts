import { IsBoolean, IsDate, IsString } from 'class-validator';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';

class CreateBulletinDto {
  @IsString()
  heading: string;

  @IsString()
  content: string;

  @IsBoolean()
  isActive: boolean;

  category: BulletinCategoryResponseDto;

  @IsDate()
  isVisibleStartDate: Date | null;

  @IsDate()
  isVisibleEndDate: Date | null;
}

export default CreateBulletinDto;
