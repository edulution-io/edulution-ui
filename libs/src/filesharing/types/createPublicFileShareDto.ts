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

import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import FILE_LINK_EXPIRY_VALUES from '@libs/filesharing/constants/fileLinkExpiryValues';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

class CreatePublicFileShareDto {
  @IsEnum(FILE_LINK_EXPIRY_VALUES)
  expires!: (typeof FILE_LINK_EXPIRY_VALUES)[number];

  @IsString()
  filePath!: string;

  @IsString()
  filename!: string;

  @IsString()
  etag!: string;

  @IsArray()
  @IsOptional()
  invitedAttendees?: AttendeeDto[];

  @IsArray()
  @IsOptional()
  invitedGroups?: MultipleSelectorGroup[];

  @IsString()
  @IsOptional()
  password?: string;
}

export default CreatePublicFileShareDto;
