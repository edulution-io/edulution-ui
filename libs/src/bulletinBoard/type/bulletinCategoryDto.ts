import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

export class BulletinCategoryDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsArray()
  @IsOptional()
  visibleByUsers?: MultipleSelectorGroup[] = [];

  @IsArray()
  @IsOptional()
  visibleByGroups?: MultipleSelectorGroup[] = [];

  @IsArray()
  @IsOptional()
  editableByUsers?: MultipleSelectorGroup[] = [];
}
