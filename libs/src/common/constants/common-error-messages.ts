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

enum CommonErrorMessages {
  DB_ACCESS_FAILED = 'common.errors.dbAccessFailed',
  DIRECTORY_CREATION_FAILED = 'common.errors.directoryNotCreated',
  FILE_CREATION_FAILED = 'common.errors.fileNotCreated',
  FILE_UPLOAD_FAILED = 'common.errors.fileUploadFailed',
  FILE_DELETION_FAILED = 'common.errors.fileDeletionFailed',
  FILE_WRITING_FAILED = 'common.errors.fileWritingFailed',
  FILE_MOVE_FAILED = 'common.errors.fileMoveFailed',
  FILE_NOT_FOUND = 'common.errors.fileNotFound',
  FILE_NOT_PROVIDED = 'common.errors.fileNotProvided',
  INVALID_FILE_TYPE = 'common.errors.invalidFileType',
  INVALID_REQUEST_DATA = 'common.errors.invalidRequestData',
  WRONG_SEVER_CONFIG = 'common.errors.wrongServerConfig',
}

export default CommonErrorMessages;
