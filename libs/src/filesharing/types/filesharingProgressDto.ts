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

import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

class FilesharingProgressDto {
  @IsNumber()
  processID: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  statusDescription: string;

  @IsNumber()
  processed: number;

  @IsNumber()
  total: number;

  @IsNumber()
  percent: number;

  @IsString()
  currentFilePath: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  failedPaths?: string[];
}

export default FilesharingProgressDto;
