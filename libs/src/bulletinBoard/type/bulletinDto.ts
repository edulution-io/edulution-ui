import { IsBoolean, IsDate, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import AttendeeDto from '@libs/user/types/attendee.dto';

export class BulletinDto {
  @ValidateNested()
  creator: AttendeeDto;

  @ValidateNested()
  @IsOptional()
  updatedBy?: AttendeeDto;

  @IsString()
  heading: string;

  @IsString()
  content: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsMongoId()
  category: string;

  @IsDate()
  @IsOptional()
  isVisibleStartDate?: Date;

  @IsDate()
  @IsOptional()
  isVisibleEndDate?: Date;
}
