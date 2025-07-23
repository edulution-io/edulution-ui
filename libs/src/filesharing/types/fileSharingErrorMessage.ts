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

enum FileSharingErrorMessage {
  FileNotFound = 'filesharing.errors.FileNotFound',
  MountPointsNotFound = 'filesharing.errors.MountPointsNotFound',
  FolderNotFound = 'filesharing.errors.FolderNotFound',
  UploadFailed = 'filesharing.errors.UploadFailed',
  DeletionFailed = 'filesharing.errors.DeletionFailed',
  RenameFailed = 'filesharing.errors.RenameFailed',
  MoveFailed = 'filesharing.errors.MoveFailed',
  CopyFailed = 'filesharing.errors.CopyFailed',
  FolderCreationFailed = 'filesharing.errors.FolderCreationFailed',
  CreateCollectFolderForStudentFailed = 'filesharing.errors.CreateCollectFolderForStudentFailed',
  CreationFailed = 'filesharing.errors.CreationFailed',
  DbAccessFailed = 'filesharing.errors.DbAccessFailed',
  WebDavError = 'filesharing.errors.WebDavError',
  DownloadFailed = 'filesharing.errors.DownloadFailed',
  SaveFailed = 'filesharing.errors.SaveFailed',
  DeleteFromServerFailed = 'filesharing.errors.DeleteFromServerFailed',
  AppNotProperlyConfigured = 'filesharing.errors.AppNotProperlyConfigured',
  DuplicateFailed = 'filesharing.errors.DuplicateFailed',
  CollectingFailed = 'filesharing.errors.CollectingFailed',
  SharingFailed = 'filesharing.errors.SharingFailed',
  MissingCallbackURL = 'filesharing.errors.MissingCallbackURL',
  PublicFileDeletionFailed = 'filesharing.publicFileSharing.errors.PublicFileDeletionFailed',
  PublicFileIsOnlyDeletableByOwner = 'filesharing.publicFileSharing.errors.PublicFileIsOnlyDeletableByOwner',
  PublicFileNotFound = 'filesharing.publicFileSharing.errors.PublicFileNotFound',
  PublicFileIsRestricted = 'filesharing.publicFileSharing.errors.PublicFileIsRestricted',
  PublicIsRestrictedByInvalidToken = 'filesharing.publicFileSharing.errors.PublicIsRestrictedByInvalidToken',
  PublicFileWrongPassword = 'filesharing.publicFileSharing.errors.PublicFileWrongPassword',
}

export default FileSharingErrorMessage;
