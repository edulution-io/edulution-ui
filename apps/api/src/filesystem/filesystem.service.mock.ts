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

const mockFilesystemService = {
  fetchFileStream: jest.fn().mockResolvedValue({ stream: { pipe: jest.fn() } }),
  ensureDirectoryExists: jest.fn(),
  generateHashedFilename: jest.fn(),
  saveFileStream: jest.fn(),
  retrieveAndSaveFile: jest.fn(),
  deleteFile: jest.fn().mockResolvedValue({}),
  fileLocation: jest.fn(),
  checkIfFileExist: jest.fn().mockResolvedValue(false),
  checkIfFileExistAndDelete: jest.fn().mockResolvedValue({}),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  deleteDirectory: jest.fn().mockResolvedValue({}),
  deleteDirectories: jest.fn().mockResolvedValue({}),
  createReadStream: jest.fn(),
  deleteEmptyFolder: jest.fn(),
  getAllFilenamesInDirectory: jest.fn().mockResolvedValue([]),
};

export default mockFilesystemService;
