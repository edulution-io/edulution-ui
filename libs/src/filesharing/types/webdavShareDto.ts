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

import { IsArray, IsBoolean, IsDate, IsMongoId, IsString } from 'class-validator';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type WebdavShareStatusType from '@libs/webdav/types/webdavShareStatusType';
import type WebdavShareAuthenticationMethodsType from '@libs/webdav/types/webdavShareAuthenticationMethodsType';
import type MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import type WebdavShareType from './webdavShareType';

class WebdavShareDto {
  @IsMongoId()
  webdavShareId?: string;

  @IsString()
  displayName: string;

  @IsString()
  url: string;

  @IsString()
  sharePath: string;

  @IsString()
  pathname: string;

  @IsString()
  rootServer: string;

  @IsBoolean()
  isRootPath: boolean;

  @IsString()
  pathVariables: MultipleSelectorOptionSH[] = [];

  @IsArray()
  accessGroups: MultipleSelectorGroup[] = [];

  @IsString()
  type: WebdavShareType;

  @IsString()
  status: WebdavShareStatusType;

  @IsDate()
  lastChecked: Date | null = null;

  @IsString()
  authentication: WebdavShareAuthenticationMethodsType;
}

export default WebdavShareDto;
