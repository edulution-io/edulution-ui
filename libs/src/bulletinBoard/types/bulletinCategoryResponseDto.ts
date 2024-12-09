import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import { IsDate, IsMongoId, IsOptional, IsString } from 'class-validator';
import AttendeeDto from '@libs/user/types/attendee.dto';

class BulletinCategoryResponseDto extends CreateBulletinCategoryDto {
  @IsMongoId()
  id: string;

  @IsDate()
  @IsOptional()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  creator: AttendeeDto;
}

export default BulletinCategoryResponseDto;
