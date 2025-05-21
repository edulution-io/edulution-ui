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

import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

const createTempFile = async (postfix = '') => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp-'));
  const fileName = randomUUID() + postfix;
  const filePath = path.join(tmpDir, fileName);
  await fs.writeFile(filePath, '');
  const cleanup = async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  };
  return { path: filePath, cleanup };
};

export default createTempFile;
