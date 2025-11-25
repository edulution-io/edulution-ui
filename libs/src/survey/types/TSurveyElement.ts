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

import TSurveyQuestionChoice from '@libs/survey/types/TSurveyQuestionChoice';
import TSurveyQuestionTypes from '@libs/survey/types/TSurveyQuestionTypes';

interface TSurveyElement {
  type: TSurveyQuestionTypes;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  title?: string;
  description?: string;
  choicesOrder?: string;
  choices?: TSurveyQuestionChoice[] | null;
  choicesByUrl?: {
    url: string;
    valueName?: string;
    titleName?: string;
    imageLink?: string;
  } | null;
  hideIfChoicesEmpty?: boolean;
  imageLink?: string;
  showOtherItem?: boolean;
  showNoneItem?: boolean;
  elements?: TSurveyElement[];
  templateElements?: TSurveyElement[];
}

export default TSurveyElement;
