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

import MailTheme from '@libs/mail/constants/mailTheme';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import DOCKER_CONTAINER_NAMES from '@libs/docker/constants/dockerContainerNames';

const MAIL_GENERAL_EXTENDED_OPTIONS: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.MAIL_SOGO_THEME,
    description: 'appExtendedOptions.mailSogoThemeDescription',
    title: 'appExtendedOptions.mailSogoThemeTitle',
    type: ExtendedOptionField.dropdown,
    value: MailTheme.DARK,
    width: 'full',
    options: [
      { id: MailTheme.DARK, name: 'appExtendedOptions.mailSogoTheme.dark' },
      { id: MailTheme.LIGHT, name: 'appExtendedOptions.mailSogoTheme.light' },
    ],
    requiredContainers: [DOCKER_CONTAINER_NAMES.MAILCOW_SOGO],
    disabledWarningText: 'appExtendedOptions.mailSogoThemeDisabled',
  },
];

export default MAIL_GENERAL_EXTENDED_OPTIONS;
