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

import { UploadItem } from '@libs/filesharing/types/uploadItem';
import { UploadFile } from '@libs/filesharing/types/uploadFile';

const isFileItem = (item: UploadItem): item is UploadFile => !(item as UploadFile).isZippedFolder;

export default isFileItem;
