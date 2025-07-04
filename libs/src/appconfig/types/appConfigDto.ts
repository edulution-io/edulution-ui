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

import { IsNumber, IsString, ValidateNested } from 'class-validator';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type ExtendedOptionKeysDto from '@libs/appconfig/types/extendedOptionKeysDto';
import { type AppConfigOptions } from './appConfigOptionsType';
import type AppIntegrationType from './appIntegrationType';
import type AppNameTranslations from './appNameTranslations';

class AppConfigDto {
  @IsString()
  name: string;

  @ValidateNested()
  translations?: AppNameTranslations;

  @IsString()
  icon: string;

  @IsString()
  appType: AppIntegrationType;

  @ValidateNested()
  options: AppConfigOptions;

  @ValidateNested()
  accessGroups: MultipleSelectorGroup[];

  @ValidateNested()
  extendedOptions?: ExtendedOptionKeysDto;

  @IsNumber()
  position: number;
}

export default AppConfigDto;
