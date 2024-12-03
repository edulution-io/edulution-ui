import { IsBoolean, IsDate, IsString, ValidateNested } from 'class-validator';
import AttendeeDto from '@libs/user/types/attendee.dto';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/type/bulletinCategoryResponseDto';

class CreateBulletinDto {
  @ValidateNested()
  creator: AttendeeDto;

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
