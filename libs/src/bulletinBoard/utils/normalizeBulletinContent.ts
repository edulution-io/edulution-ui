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

import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import BULLETIN_TEMP_FILES_PATH from '@libs/bulletinBoard/constants/bulletinboardTempFilesPath';
import APPS from '@libs/appconfig/constants/apps';
import { Logger } from '@nestjs/common';

const normalizeBulletinContent = async (originalHtml: string) => {
  const TEMP_PREFIX_HTML = 'edu-api/files/file/temp/bulletinboard/attachments/';
  const FINAL_PREFIX_HTML = 'edu-api/files/file/bulletinboard/attachments/';
  const tempLinkPattern = /edu-api\/files\/file\/temp\/bulletinboard\/attachments\/([^"?]+\.(?:png|jpe?g|gif|pdf))/gi;

  const relocationTasks = Array.from(originalHtml.matchAll(tempLinkPattern)).map(([, relativePath]) => {
    const sourcePath = join(BULLETIN_TEMP_FILES_PATH, relativePath);
    const destinationPath = join(APPS_FILES_PATH, APPS.BULLETIN_BOARD, 'attachments', relativePath);

    return fs
      .mkdir(dirname(destinationPath), { recursive: true })
      .then(() => fs.rename(sourcePath, destinationPath))
      .catch((error) => Logger.verbose(error));
  });

  const cleanedHtml = originalHtml.replaceAll(TEMP_PREFIX_HTML, FINAL_PREFIX_HTML);

  await Promise.all(relocationTasks);

  return {
    cleanedContent: cleanedHtml,
  };
};

export default normalizeBulletinContent;
