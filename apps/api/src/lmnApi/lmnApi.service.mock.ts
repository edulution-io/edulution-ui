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
