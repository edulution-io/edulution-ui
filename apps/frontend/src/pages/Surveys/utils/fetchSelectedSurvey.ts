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

import SurveyDto from '@libs/survey/types/api/survey.dto';
import { PUBLIC_SURVEYS, SURVEY_FIND_ONE_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import eduApi from '@/api/eduApi';

const fetchSelectedSurvey = async (surveyId?: string, isPublic?: boolean): Promise<SurveyDto | undefined> => {
  if (!surveyId) {
    return Promise.resolve(undefined);
  }
  try {
    if (isPublic) {
      const response = await eduApi.get<SurveyDto>(`${PUBLIC_SURVEYS}/${surveyId}`);
      return response.data;
    } else {
      const response = await eduApi.get<SurveyDto>(`${SURVEY_FIND_ONE_ENDPOINT}/${surveyId}`);
      return response.data;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

export default fetchSelectedSurvey;
