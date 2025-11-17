/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
    const includedNames = await readdir(SURVEYS_FILES_PATH);
    if (includedNames.length > 1) {
      try {
        await ensureDir(SURVEYS_ATTACHMENT_PATH);
      } catch (error) {
        Logger.error(`Failed to create directory ${SURVEYS_ATTACHMENT_PATH}`, surveysMigration001Attachments.name);
      }
    }
    const includedFolders = includedNames.filter(async (folder) => {
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
