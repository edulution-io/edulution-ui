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

import Busboy from 'busboy';
import { lookup } from 'mime-types';
import { Readable } from 'stream';
import UploadFileDto from '@libs/filesharing/types/uploadFileDto';
import ParsedUpload from '@libs/filesharing/types/parsedUpload';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { Request } from 'express';

const parseMultipartUpload = (req: Request) =>
  new Promise<ParsedUpload>((resolve, reject) => {
    let basePath: string | undefined;
    let originalFolderName: string | undefined;
    let isZippedFolder = false;
    let explicitName: string | undefined;
    let fileSize: number;

    const busboy = Busboy({ headers: req.headers });
    busboy.on('field', (field, val) => {
      switch (field) {
        case 'path':
        case 'currentPath':
          basePath = val;
          break;
        case 'uploadFileDto':
          try {
            const dto = JSON.parse(val) as UploadFileDto;
            originalFolderName = dto.originalFolderName;
            isZippedFolder = Boolean(dto.isZippedFolder);
            explicitName = dto.name;
          } catch (error) {
            console.error(error);
          }
          break;
        case 'size':
          fileSize = Number(val) || 0;
          break;
        default:
          break;
      }
    });

    busboy.on('file', (_field: string, stream: Readable, filename: string, _enc: string, mimetype: string) => {
      const mimeType = mimetype || lookup(filename) || RequestResponseContentType.APPLICATION_OCTET_STREAM;
      const finalName = explicitName ?? filename;

      resolve({
        basePath: basePath || '',
        isZippedFolder,
        originalFolderName,
        name: finalName,
        stream,
        mimeType,
        fileSize,
      });
    });

    busboy.on('error', reject);
    req.pipe(busboy);
  });

export default parseMultipartUpload;
