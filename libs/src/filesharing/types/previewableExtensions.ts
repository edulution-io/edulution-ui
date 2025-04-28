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

import OnlyOfficeDocumentTypes from '@libs/filesharing/constants/OnlyOfficeDocumentTypes';
import VideoExtensions from '@libs/filesharing/types/videoExtensions';
import ImageExtensions from '@libs/filesharing/types/imageExtensions';
import AudioExtensions from '@libs/filesharing/types/audioExtensions';

const previewable = new Set<string>(
  [
    ...Object.values(ImageExtensions),
    ...Object.values(VideoExtensions),
    ...Object.values(AudioExtensions),
    ...Object.values(OnlyOfficeDocumentTypes),
  ].map((ext) => ext.toLowerCase()),
);

const isPreviewableExtension = (ext?: string): boolean => {
  if (!ext) return false;
  return previewable.has(ext.startsWith('.') ? ext.slice(1).toLowerCase() : ext.toLowerCase());
};

export default isPreviewableExtension;
