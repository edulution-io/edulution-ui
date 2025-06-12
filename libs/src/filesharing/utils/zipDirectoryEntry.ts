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

import addEntryToZipFile from '@libs/filesharing/utils/addEntryToZipFile';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { UploadFile } from '@libs/filesharing/types/uploadFile';

const zipDirectoryEntry = async (dirEntry: FileSystemDirectoryEntry): Promise<UploadFile> => {
  const bytes = await addEntryToZipFile(dirEntry);
  const blob = new Blob([bytes], { type: RequestResponseContentType.APPLICATION_ZIP });

  return Object.assign(new File([blob], `${dirEntry.name}.zip`, { type: RequestResponseContentType.APPLICATION_ZIP }), {
    isZippedFolder: true as const,
    originalFolderName: dirEntry.name,
  }) as UploadFile;
};

export default zipDirectoryEntry;
