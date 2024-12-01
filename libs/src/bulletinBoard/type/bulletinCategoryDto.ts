import { IsArray, IsBoolean, IsDate, IsString } from 'class-validator';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

export class BulletinCategoryDto {
  @IsString()
  name: string;

  @IsBoolean()
  isActive?: boolean = true;

  @IsArray()
  visibleForUsers: MultipleSelectorOptionSH[] = [];

  @IsArray()
  visibleForGroups: MultipleSelectorOptionSH[] = [];

  @IsArray()
  editableByUsers: MultipleSelectorOptionSH[] = [];

  @IsArray()
  editableByGroups: MultipleSelectorOptionSH[] = [];

  @IsString()
  createdBy: MultipleSelectorOptionSH;

  @IsDate()
  creationDate: Date;
}
