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

import { z } from 'zod';
import { t } from 'i18next';

const saveExternalFileFormSchema = z.object({
  filename: z
    .string()
    .trim()
    .min(1, t('filesharing.tooltips.NameRequired'))
    .max(30, t('filesharing.tooltips.NameExceedsCharacterLimit'))
    .refine((v) => !v.endsWith('.'), {
      message: t('filesharing.tooltips.NameMustNotEndWithDot'),
    }),
});

export type SaveExternalFileFormValues = z.infer<typeof saveExternalFileFormSchema>;

export default saveExternalFileFormSchema;
