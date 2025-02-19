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

import { Readable } from 'stream';
import CustomFile from '@libs/filesharing/types/customFile';

const fileStream = new Readable();
fileStream.push(Buffer.from('file content'));
fileStream.push(null);

const mockFile: CustomFile = {
  buffer: Buffer.from('test content'),
  stream: fileStream,
  fieldname: 'uploadedFile',
  originalname: 'testfile.txt',
  encoding: '7bit',
  mimetype: 'text/plain',
  size: 1234,
  destination: 'uploads/',
  filename: 'testfile.txt',
  path: 'uploads/testfile.txt',
};

export default mockFile;
