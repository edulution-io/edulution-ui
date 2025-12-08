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

enum LmnApiErrorMessage {
  GetUserSessionsFailed = 'lmnApi.errors.GetUserSessionsFailed',
  AddUserSessionsFailed = 'lmnApi.errors.AddUserSessionsFailed',
  RemoveUserSessionsFailed = 'lmnApi.errors.RemoveUserSessionsFailed',
  UpdateUserSessionsFailed = 'lmnApi.errors.UpdateUserSessionsFailed',
  StartExamModeFailed = 'lmnApi.errors.StartExamModeFailed',
  PrintPasswordsFailed = 'lmnApi.errors.PrintPasswordsFailed',
  StopExamModeFailed = 'lmnApi.errors.StopExamModeFailed',
  RemoveManagementGroupFailed = 'lmnApi.errors.RemoveManagementGroupFailed',
  AddManagementGroupFailed = 'lmnApi.errors.AddManagementGroupFailed',
  GetUserSchoolClassesFailed = 'lmnApi.errors.GetUserSchoolClassesFailed',
  ToggleSchoolClassJoinedFailed = 'lmnApi.errors.ToggleSchoolClassJoinedFailed',
  ToggleProjectJoinedFailed = 'lmnApi.errors.ToggleProjectJoinedFailed',
  TogglePrinterJoinedFailed = 'lmnApi.errors.TogglePrinterJoinedFailed',
  GetPrintersFailed = 'lmnApi.errors.GetPrintersFailed',
  GetUserSchoolClassFailed = 'lmnApi.errors.GetUserSchoolClassFailed',
  GetUserProjectsFailed = 'lmnApi.errors.GetUserProjectsFailed',
  GetUserFailed = 'lmnApi.errors.GetUserFailed',
  UpdateUserFailed = 'lmnApi.errors.UpdateUserFailed',
  GetCurrentUserRoomFailed = 'lmnApi.errors.GetCurrentUserRoomFailed',
  CreateProjectFailed = 'lmnApi.errors.CreateProjectFailed',
  RemoveProjectFailed = 'lmnApi.errors.RemoveProjectFailed',
  UpdateProjectFailed = 'lmnApi.errors.UpdateProjectFailed',
  SearchUsersOrGroupsFailed = 'lmnApi.errors.SearchUsersOrGroupsFailed',
  GetProjectFailed = 'lmnApi.errors.GetProjectFailed',
  PasswordMismatch = 'lmnApi.errors.PasswordMismatch',
  PasswordChangeFailed = 'lmnApi.errors.PasswordChangeFailed',
  GetUsersQuotaFailed = 'lmnApi.errors.GetUsersQuotaFailed',
  GetSchoolsFailed = 'lmnApi.errors.GetSchoolsFailed',
  GetLmnVersionFailed = 'lmnApi.errors.GetLmnVersionFailed',
}

export default LmnApiErrorMessage;
