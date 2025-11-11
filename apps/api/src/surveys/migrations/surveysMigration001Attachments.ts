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

import { readdir, ensureDir, moveSync, stat as fsStat } from 'fs-extra';
import { Logger } from '@nestjs/common';
import SURVEYS_FILES_PATH from '@libs/survey/constants/surveysFilesPath';
import SURVEYS_FILE_FOLDERS from '@libs/survey/constants/surveysFileFolders';
import SURVEYS_ATTACHMENT_PATH from '@libs/survey/constants/surveysAttachmentPath';

const name = '001-move-survey-attachments-into-attachment-folder';

const surveysMigration001Attachments = {
  name,
  version: 1,
  execute: async () => {
    const includedFolders = await readdir(SURVEYS_FILES_PATH);
    if (includedFolders.length > 1) {
      try {
        await ensureDir(SURVEYS_ATTACHMENT_PATH);
      } catch (error) {
        Logger.error(`Failed to create directory ${SURVEYS_ATTACHMENT_PATH}`, surveysMigration001Attachments.name);
      }
    }
    includedFolders.filter(async (folder) => {
      const stat = await fsStat(`${SURVEYS_FILES_PATH}/${folder}`);
      if (stat.isDirectory()) {
        return true;
      }
      return false;
    });
    includedFolders.forEach((folder) => {
      if (!SURVEYS_FILE_FOLDERS.includes(folder)) {
        try {
          moveSync(`${SURVEYS_FILES_PATH}/${folder}`, `${SURVEYS_ATTACHMENT_PATH}/${folder}`);
          Logger.log(`Moved folder ${folder} to ${SURVEYS_ATTACHMENT_PATH}`, surveysMigration001Attachments.name);
        } catch (error) {
          Logger.error(
            `Failed to move folder ${folder} to ${SURVEYS_ATTACHMENT_PATH}`,
            surveysMigration001Attachments.name,
          );
        }
      }
    });
  },
};

export default surveysMigration001Attachments;
