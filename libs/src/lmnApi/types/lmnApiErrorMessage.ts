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
}

export default LmnApiErrorMessage;
