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

const mockAttachmentService = {
  getTemporaryAttachmentUrl: jest.fn().mockResolvedValue('temporalAttachmentUrl'),
  getPersistentAttachmentUrl: jest.fn().mockResolvedValue('permanentAttachmentUrl'),
  getAllFilenamesInTemporaryDirectory: jest.fn().mockResolvedValue(['temporalAttachment01', 'temporalAttachment02']),
  deleteTemporaryDirectory: jest.fn(),
  deletePermanentDirectories: jest.fn(),
  serveTemporaryAttachment: jest.fn().mockResolvedValue({ stream: { pipe: jest.fn() } }),
  servePersistentAttachment: jest.fn().mockResolvedValue({ stream: { pipe: jest.fn() } }),
  moveTempFileIntoPermanentDirectory: jest.fn(),
  moveTempFilesIntoPermanentDirectory: jest.fn(),
};

export default mockAttachmentService;
