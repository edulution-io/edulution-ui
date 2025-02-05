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

const mockLmnApiService = {
  printPasswords: jest.fn(),
  startExamMode: jest.fn(),
  stopExamMode: jest.fn(),
  addManagementGroup: jest.fn(),
  removeManagementGroup: jest.fn(),
  getSchoolClass: jest.fn(),
  getUserSchoolClasses: jest.fn(),
  toggleSchoolClassJoined: jest.fn(),
  getCurrentUserRoom: jest.fn(),
  getUserSession: jest.fn(),
  getUserSessions: jest.fn(),
  addUserSession: jest.fn(),
  removeUserSession: jest.fn(),
  updateUserSession: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
  getUsersQuota: jest.fn(),
  searchUsersOrGroups: jest.fn(),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
  getProject: jest.fn(),
  getUserProjects: jest.fn(),
  toggleProjectJoined: jest.fn(),
  togglePrinterJoined: jest.fn(),
  getPrinters: jest.fn(),
  changePassword: jest.fn(),
  setFirstPassword: jest.fn(),
};

export default mockLmnApiService;
