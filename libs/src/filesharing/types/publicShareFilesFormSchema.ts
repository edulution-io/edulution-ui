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

import FILE_LINK_EXPIRY_VALUES from '@libs/filesharing/constants/fileLinkExpiryValues';
import { z } from 'zod';
import { t } from 'i18next';
import groupSchema from '@libs/common/constants/groupSchema';

const publicShareFilesFormSchema = z.object({
  expires: z.enum(FILE_LINK_EXPIRY_VALUES, {
    required_error: t('filesharing.tooltips.expiryRequired'),
    invalid_type_error: t('filesharing.tooltips.expiryInvalid'),
  }),
  invitedAttendees: z
    .array(
      z.intersection(
        z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string(),
        }),
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ),
    )
    .optional(),
  invitedGroups: z.array(groupSchema).optional(),
  password: z
    .string()
    .max(64, { message: t('filesharing.tooltips.passwordMaxLength') })
    .optional(),
});

export default publicShareFilesFormSchema;
