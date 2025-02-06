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

import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

const ONLY_OFFICE_EXTENDED_OPTIONS: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.ONLY_OFFICE_URL,
    description: 'appExtendedOptions.onlyOfficeUrl',
    title: 'appExtendedOptions.onlyOfficeUrlTitle',
    type: ExtendedOptionField.input,
    value: '',
    width: 'full',
  },
  {
    name: ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET,
    title: 'appExtendedOptions.onlyOfficeJwtSecretTitle',
    description: 'appExtendedOptions.onlyOfficeJwtSecretDescription',
    type: ExtendedOptionField.password,
    value: '',
    width: 'full',
  },
];

export default ONLY_OFFICE_EXTENDED_OPTIONS;
