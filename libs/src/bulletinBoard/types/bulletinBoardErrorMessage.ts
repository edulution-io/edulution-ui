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
