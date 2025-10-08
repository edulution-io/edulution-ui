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
import TAppFieldWidth from '@libs/appconfig/types/tAppFieldWidth';

const WEBDAV_SHARE_TABLE_EXTENDED_OPTIONS = [
  {
    name: ExtendedOptionKeys.WEBDAV_SERVER_TABLE,
    description: 'appExtendedOptions.webdavServers',
    title: 'webdavShares.title',
    type: ExtendedOptionField.table,
    value: '',
    width: 'full' as TAppFieldWidth,
    showTitle: true,
  },
  {
    name: ExtendedOptionKeys.WEBDAV_SHARE_TABLE,
    description: 'webdavShares.title',
    title: 'webdavShares.title',
    type: ExtendedOptionField.table,
    value: '',
    width: 'full' as TAppFieldWidth,
    showTitle: true,
  },
];

export default WEBDAV_SHARE_TABLE_EXTENDED_OPTIONS;
