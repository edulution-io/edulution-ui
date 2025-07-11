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

import ChoiceDto from '@libs/survey/types/api/choice.dto';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';
import SurveyDto from './survey.dto';

interface SurveyTemplateDto {
  template: Partial<SurveyDto> & { formula: TSurveyFormula };
  backendLimiters?: { questionName: string; choices: ChoiceDto[] }[];
  fileName?: string;
  title?: string;
  description?: string;
  author?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  icon?: string;
}

export default SurveyTemplateDto;
