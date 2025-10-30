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

import MAIL_ENDPOINT from '@libs/mail/constants/mail-endpoint';
import ExtendedOptionKeys from './extendedOptionKeys';

const UPDATE_CHECKER_ENDPOINTS: Record<string, string> = {
  [ExtendedOptionKeys.MAIL_SOGO_THEME_UPDATE_CHECKER]: MAIL_ENDPOINT,
};

export default UPDATE_CHECKER_ENDPOINTS;
