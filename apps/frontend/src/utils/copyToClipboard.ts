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

import { toast } from 'sonner';
import ToasterTranslationIds from '@libs/ui/types/toasterTranslationIds';
import i18n from '@/i18n';

const copyToClipboard = (url: string, toasterTranslationIds?: ToasterTranslationIds) => {
  navigator.clipboard
    .writeText(url)
    .then(() => {
      toast.info(i18n.t(toasterTranslationIds?.success || 'common.copy.success'));
    })
    .catch(() => {
      toast.error(i18n.t(toasterTranslationIds?.error || 'common.copy.error'));
    });
};

export default copyToClipboard;
