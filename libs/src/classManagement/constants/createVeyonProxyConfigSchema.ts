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

import { TFunction } from 'i18next';
import { z } from 'zod';

const createVeyonProxyConfigSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    subnet: z
      .string()
      .regex(/^(([0-9]{1,3}\.){3}[0-9]{1,3}\/(3[0-2]|[1-2][0-9]|[0-9]))$/, {
        message: t('common.invalid_cidr_format'),
      })
      .refine(
        (value) => {
          const [ip, prefix] = value.split('/');
          const octets = ip.split('.').map(Number);
          return (
            octets.length === 4 &&
            octets.every((octet) => octet >= 0 && octet <= 255) &&
            Number(prefix) >= 0 &&
            Number(prefix) <= 32
          );
        },
        { message: t('common.invalid_cidr_format') },
      ),
    proxyAdress: z.string().url({ message: t('common.invalid_url') }),
  });

export default createVeyonProxyConfigSchema;
