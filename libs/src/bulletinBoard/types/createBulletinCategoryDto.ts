/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { IsArray, IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AttendeeDto from '@libs/user/types/attendee.dto';
import BulletinVisibilityStatesType from '@libs/bulletinBoard/types/bulletinVisibilityStatesType';
import BULLETIN_VISIBILITY_STATES from '@libs/bulletinBoard/constants/bulletinVisibilityStates';

class CreateBulletinCategoryDto {
  @IsString()
  name: string;

  @IsBoolean()
  isActive: boolean;

  @IsArray()
  visibleForUsers: AttendeeDto[] = [];

  @IsArray()
  visibleForGroups: MultipleSelectorGroup[] = [];

  @IsArray()
  editableByUsers: AttendeeDto[] = [];

  @IsArray()
  editableByGroups: MultipleSelectorGroup[] = [];

  @IsNumber()
  position: number;

  @IsEnum(BULLETIN_VISIBILITY_STATES)
  bulletinVisibility?: BulletinVisibilityStatesType;
}

export default CreateBulletinCategoryDto;
