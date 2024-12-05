import { IsDate, IsMongoId, ValidateNested } from 'class-validator';
import AttendeeDto from '@libs/user/types/attendee.dto';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';

class BulletinResponseDto extends CreateBulletinDto {
  @ValidateNested()
  creator: AttendeeDto;

  @IsMongoId()
  id: string;

  @ValidateNested()
  updatedBy: AttendeeDto;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export default BulletinResponseDto;
