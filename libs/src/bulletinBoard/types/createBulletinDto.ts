import { IsArray, IsBoolean, IsDate, IsString, ValidateNested } from 'class-validator';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';

class CreateBulletinDto {
  @IsString()
  heading: string;

  @IsString()
  content: string;

  @IsArray()
  @IsString({ each: true })
  attachmentFileNames: string[];

  @IsBoolean()
  isActive: boolean;

  @ValidateNested()
  category: BulletinCategoryResponseDto;

  @IsDate()
  isVisibleStartDate: Date | null;

  @IsDate()
  isVisibleEndDate: Date | null;
}

export default CreateBulletinDto;
