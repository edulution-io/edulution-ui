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

enum BulletinBoardErrorMessage {
  CATEGORY_NOT_FOUND = 'bulletinboard.errors.categoryNotFound',
  CATEGORY_DELETE_FAILED = 'bulletinboard.errors.categoryDeleteFailed',
  INVALID_CATEGORY = 'bulletinboard.errors.invalidCategory',
  BULLETIN_NOT_FOUND = 'bulletinboard.errors.bulletinNotFound',
  UNAUTHORIZED_UPDATE_BULLETIN = 'bulletinboard.errors.unauthorizedUpdateBulletin',
  UNAUTHORIZED_DELETE_BULLETIN = 'bulletinboard.errors.unauthorizedDeleteBulletin',
  UNAUTHORIZED_CREATE_BULLETIN = 'bulletinboard.errors.unauthorizedCreateBulletin',
  UNAUTHORIZED_CREATE_CATEGORY = 'bulletinboard.errors.unauthorizedCreateCategory',
  UNAUTHORIZED_DELETE_CATEGORY = 'bulletinboard.errors.unauthorizedDeleteCategory',
  UNAUTHORIZED_UPDATE_CATEGORY = 'bulletinboard.errors.unauthorizedUpdateCategory',
  ATTACHMENT_NOT_FOUND = 'bulletinboard.errors.attachmentNotFound',
  ATTACHMENT_DELETION_FAILED = 'bulletinboard.errors.attachmentDeletionFailed',
}

export default BulletinBoardErrorMessage;
