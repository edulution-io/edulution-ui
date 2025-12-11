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

enum FileSharingErrorMessage {
  FileNotFound = 'filesharing.errors.FileNotFound',
  MountPointsNotFound = 'filesharing.errors.MountPointsNotFound',
  FolderNotFound = 'filesharing.errors.FolderNotFound',
  UploadFailed = 'filesharing.errors.UploadFailed',
  DeletionFailed = 'filesharing.errors.DeletionFailed',
  RenameFailed = 'filesharing.errors.RenameFailed',
  MoveFailed = 'filesharing.errors.MoveFailed',
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
