import { IsDate, IsMongoId, ValidateNested } from 'class-validator';
import AttendeeDto from '@libs/user/types/attendee.dto';
import CreateBulletinDto from '@libs/bulletinBoard/type/createBulletinDto';

class BulletinResponseDto extends CreateBulletinDto {
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
