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

const mockFilesystemService = {
  fetchFileStream: jest.fn().mockResolvedValue({ stream: { pipe: jest.fn() } }),
  ensureDirectoryExists: jest.fn(),
  generateHashedFilename: jest.fn(),
  saveFileStream: jest.fn(),
  getOutputFilePath: jest.fn(),
  retrieveAndSaveFile: jest.fn(),
  deleteFile: jest.fn(),
  fileLocation: jest.fn(),
  checkIfFileExistAndDelete: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  deleteDirectories: jest.fn(),
  createReadStream: jest.fn(),
};

export default mockFilesystemService;
