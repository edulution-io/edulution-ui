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

const PAGE_WITH_PUBLIC_ASSETS_CONFIG: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.PAGE_HAS_PUBLIC_ASSETS,
    description: 'settings.appconfig.sections.hasPublicAssets.publicAssetAvailability',
    title: 'public',
    type: ExtendedOptionField.switch,
    value: '',
    width: 'full',
  },
];

export default PAGE_WITH_PUBLIC_ASSETS_CONFIG;
