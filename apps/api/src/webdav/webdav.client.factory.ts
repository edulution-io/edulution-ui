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

import axios from 'axios';
import { Agent as HttpsAgent } from 'https';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';

class WebdavClientFactory {
  static createWebdavClient(baseUrl: string, username: string, password: string) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');

    const httpsAgent = new HttpsAgent({
      rejectUnauthorized: false,
    });

    return axios.create({
      baseURL: baseUrl,
      headers: {
        [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_XML,
        Authorization: `Basic ${token}`,
      },
      httpsAgent,
    });
  }
}

export default WebdavClientFactory;
