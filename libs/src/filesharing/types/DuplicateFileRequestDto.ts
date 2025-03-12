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

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

class DuplicateFileRequestDto {
  constructor(originFilePath: string, destinationFilePaths: string[]) {
    this.originFilePath = originFilePath;
    this.destinationFilePaths = destinationFilePaths;
  }

  @ApiProperty({
    description: 'The original path of the file that will be duplicated',
    example: '/teachers/agy-netzint-teacher/Thesis/aaa.txt',
  })
  @IsString()
  originFilePath: string;

  @ApiProperty({
    description: 'List of destination paths where the file will be duplicated',
    example: ['/teachers/ni-teacher/aaa_copy1.txt', '/teachers/ni-teacher/test/aaa_copy2.txt'],
  })
  @IsArray()
  @IsString({ each: true })
  destinationFilePaths: string[];
}

export default DuplicateFileRequestDto;
