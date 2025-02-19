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

const MAIL_IMAP_EXTENDED_OPTIONS: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.MAIL_IMAP_URL,
    title: 'appExtendedOptions.mailImapUrlTitle',
    description: 'appExtendedOptions.mailImapUrlDescription',
    type: ExtendedOptionField.input,
    value: 'webmail.schulung.multi.schule',
    width: 'full',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_PORT,
    title: 'appExtendedOptions.mailImapPortTitle',
    description: 'appExtendedOptions.mailImapPortDescription',
    type: ExtendedOptionField.number,
    value: 993,
    width: 'third',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_SECURE,
    title: 'appExtendedOptions.mailImapSecureTitle',
    description: 'appExtendedOptions.mailImapSecureDescription',
    type: ExtendedOptionField.switch,
    value: true,
    width: 'third',
  },
  {
    name: ExtendedOptionKeys.MAIL_IMAP_TLS_REJECT_UNAUTHORIZED,
    title: 'appExtendedOptions.mailImapRejectUnauthorizedTitle',
    description: 'appExtendedOptions.mailImapRejectUnauthorizedDescription',
    type: ExtendedOptionField.switch,
    value: false,
    width: 'third',
  },
];

export default MAIL_IMAP_EXTENDED_OPTIONS;
