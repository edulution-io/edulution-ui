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

import APPS_FILES_PATH from './appsFilesPath';
import PUBLIC_DOWNLOADS_PATH from './publicDownloadsPath';
import TRAEFIK_CONFIG_FILES_PATH from './traefikConfigPath';
import TEMP_FILES_PATH from '../../filesystem/constants/tempFilesPath';

const folderPaths = [APPS_FILES_PATH, PUBLIC_DOWNLOADS_PATH, TRAEFIK_CONFIG_FILES_PATH, TEMP_FILES_PATH];

export default folderPaths;
