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
import ATTACHMENT_FOLDER from '@libs/common/constants/attachmentFolder';
import SURVEY_ANSWER_FOLDER from '@libs/survey/constants/surveysAnswerFolder';
import TEMP_FILES_PATH from '@libs/filesystem/constants/tempFilesPath';

const SURVEYS_ANSWERS_TEMPORARY_ATTACHMENT_PATH = join(TEMP_FILES_PATH, SURVEY_ANSWER_FOLDER, ATTACHMENT_FOLDER);

export default SURVEYS_ANSWERS_TEMPORARY_ATTACHMENT_PATH;
