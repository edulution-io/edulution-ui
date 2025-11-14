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
import AttendeeDto from '@libs/user/types/attendee.dto';
import getFirstValidDateOfArray from '@libs/common/utils/Date/getFirstValidDateOfArray';
import surveysDefaultValues from './surveys-default-values';

const getInitialSurveyFormValues = (
  creator: AttendeeDto,
  selectedSurvey?: SurveyDto,
  storedSurvey?: SurveyDto,
): SurveyDto => {
  const expiresDate = getFirstValidDateOfArray(storedSurvey?.expires, selectedSurvey?.expires);

  return {
    id: storedSurvey?.id || selectedSurvey?.id,
    formula: storedSurvey?.formula || selectedSurvey?.formula || surveysDefaultValues.formula,
    backendLimiters: storedSurvey?.backendLimiters || selectedSurvey?.backendLimiters || [],
    saveNo: storedSurvey?.saveNo || selectedSurvey?.saveNo || 0,
    creator,
    invitedAttendees: storedSurvey?.invitedAttendees || selectedSurvey?.invitedAttendees || [],
    invitedGroups: storedSurvey?.invitedGroups || selectedSurvey?.invitedGroups || [],
    participatedAttendees: storedSurvey?.participatedAttendees || selectedSurvey?.participatedAttendees || [],
    answers: storedSurvey?.answers || selectedSurvey?.answers || [],
    createdAt: storedSurvey?.createdAt || selectedSurvey?.createdAt || new Date(),
    expires: expiresDate,
    isAnonymous: storedSurvey?.isAnonymous ?? selectedSurvey?.isAnonymous ?? surveysDefaultValues.isAnonymous,
    canSubmitMultipleAnswers:
      storedSurvey?.canSubmitMultipleAnswers ??
      selectedSurvey?.canSubmitMultipleAnswers ??
      surveysDefaultValues.canSubmitMultipleAnswers,
    isPublic: storedSurvey?.isPublic ?? selectedSurvey?.isPublic ?? surveysDefaultValues.isPublic,
    canUpdateFormerAnswer:
      storedSurvey?.canUpdateFormerAnswer ??
      selectedSurvey?.canUpdateFormerAnswer ??
      surveysDefaultValues.canUpdateFormerAnswer,
  };
};

export default getInitialSurveyFormValues;
