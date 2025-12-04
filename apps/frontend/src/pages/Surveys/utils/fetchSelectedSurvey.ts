/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
    }
    const response = await eduApi.get<SurveyDto>(`${SURVEY_FIND_ONE_ENDPOINT}/${surveyId}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default fetchSelectedSurvey;
