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

import VIDEO_EXTENSIONS from '@libs/filesharing/types/videoExtensions';
import VideoExtensionType from '@libs/filesharing/types/videoExtensionType';
import AudioExtensionsType from '@libs/filesharing/types/audioExtensionsType';
import AUDIO_EXTENSIONS from '@libs/filesharing/types/audioExtensions';

const isMediaExtension = (extension: string | undefined): boolean =>
  Object.values(VIDEO_EXTENSIONS).includes(extension as VideoExtensionType) ||
  Object.values(AUDIO_EXTENSIONS).includes(extension as AudioExtensionsType);

export default isMediaExtension;
