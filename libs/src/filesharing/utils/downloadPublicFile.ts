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

const downloadFileWithPassword = async (
  url: string,
  filename: string,
  password: string | undefined,
  onWrongPassword?: () => void,
  authToken?: string,
) => {
  const res = await axios.post(
    url,
    { password },
    {
      responseType: 'blob',
      validateStatus: (s) => s < 300 || s === 401 || s === 403,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    },
  );

  if (res.status === 401 || res.status === 403) {
    onWrongPassword?.();
    return;
  }

  const blobUrl = URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
};

export default downloadFileWithPassword;
