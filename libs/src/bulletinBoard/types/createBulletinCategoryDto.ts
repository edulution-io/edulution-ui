import { IsArray, IsBoolean, IsString } from 'class-validator';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

class CreateBulletinCategoryDto {
  @IsString()
  name: string;

  @IsBoolean()
  isActive: boolean;

  @IsArray()
  visibleForUsers: MultipleSelectorOptionSH[] = [];

  @IsArray()
  visibleForGroups: MultipleSelectorOptionSH[] = [];

  @IsArray()
  editableByUsers: MultipleSelectorOptionSH[] = [];

  @IsArray()
  editableByGroups: MultipleSelectorOptionSH[] = [];
}

export default CreateBulletinCategoryDto;
