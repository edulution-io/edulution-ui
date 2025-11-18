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

import TSurveyElement from '@libs/survey/types/TSurveyElement';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';

const resetSurveyIdForRestfulChoices = (elements: TSurveyElement[] | undefined, surveyId: string) =>
  (elements || []).map((el) => {
    if (el.choicesByUrl && el.choicesByUrl.url.includes(surveyId)) {
      return {
        ...el,
        choicesByUrl: {
          ...el.choicesByUrl,
          url: el.choicesByUrl.url.replace(`/${surveyId}/`, `/${TEMPORAL_SURVEY_ID_STRING}/`),
        },
      };
    }
    return el;
  });

export default resetSurveyIdForRestfulChoices;
