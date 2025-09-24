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

const EMBEDDED_PAGE_EDITOR_CONFIG: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.EMBEDDED_PAGE_HTML_MODE,
    description: '',
    title: 'common.mode',
    type: ExtendedOptionField.switch,
    value: '',
    width: 'full',
  },
  {
    name: ExtendedOptionKeys.EMBEDDED_PAGE_HTML_CONTENT,
    description: 'fileTable.description',
    title: 'fileTable.title',
    type: ExtendedOptionField.textarea,
    value: '',
    width: 'full',
  },
  {
    name: ExtendedOptionKeys.EMBEDDED_PAGE_TABLE,
    description: 'fileTable.description',
    title: 'fileTable.title',
    type: ExtendedOptionField.table,
    value: '',
    width: 'full',
  },
  {
    name: ExtendedOptionKeys.EMBEDDED_PAGE_IS_PUBLIC,
    description: 'settings.appconfig.sections.editor.visibilityDescription',
    title: 'common.visibility',
    type: ExtendedOptionField.switch,
    value: '',
    width: 'full',
  },
];

export default EMBEDDED_PAGE_EDITOR_CONFIG;
