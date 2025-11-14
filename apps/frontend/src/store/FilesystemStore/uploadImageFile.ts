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

import eduApi from '@/api/eduApi';
import handleApiError from '@/utils/handleApiError';
import { extension as mimeExtension } from 'mime-types';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import convertImageFileToWebp from '@libs/common/utils/convertImageFileToWebp';

type UploadImageFileProps = {
  destination: string;
  filename: string;
  file: File | Blob;
  appName?: string;
};

const uploadImageFile = async ({ destination, filename, file, appName }: UploadImageFileProps) => {
  try {
    const form = new FormData();
    form.append('destination', destination);
    form.append('filename', filename);

    if (file instanceof File) {
      const webpFile = await convertImageFileToWebp(file);
      form.append('file', webpFile, filename);
    } else if (file instanceof Blob) {
      const type = file.type || RequestResponseContentType.APPLICATION_OCTET_STREAM;
      const ext = mimeExtension(type);
      const fullName =
        ext && !filename.toLowerCase().endsWith(`.${ext.toLowerCase()}`) ? `${filename}.${ext}` : filename;

      const wrapped = new File([file], fullName, { type });
      form.append('file', wrapped, fullName);
    } else {
      return;
    }

    const url = appName ? `${EDU_API_CONFIG_ENDPOINTS.FILES}/${appName}` : `${EDU_API_CONFIG_ENDPOINTS.FILES}`;
    await eduApi.post<void>(url, form);
  } catch (err: unknown) {
    if (err instanceof Error) {
      handleApiError(err, () => {});
    } else {
      handleApiError(new Error('Unknown upload error'), () => {});
    }
  }
};

export default uploadImageFile;
