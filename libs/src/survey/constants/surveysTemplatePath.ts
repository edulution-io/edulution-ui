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

import { join } from 'path';
import APPS from '@libs/appconfig/constants/apps';
import ASSETS_FILES_PATH from '@libs/common/constants/assetsFilesPath';
import { TEMPLATES } from '@libs/survey/constants/surveys-endpoint';

const SURVEYS_TEMPLATE_PATH = join(ASSETS_FILES_PATH, 'api', APPS.SURVEYS, TEMPLATES);

export default SURVEYS_TEMPLATE_PATH;
