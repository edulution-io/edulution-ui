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

import { t } from 'i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';

const getInitialSurveyFormByTemplate = (creator: AttendeeDto, template?: SurveyTemplateDto): SurveyDto => ({
  id: undefined,
  formula: template?.template.formula || { title: t('survey.newTitle').toString() },
  backendLimiters: template?.template.backendLimiters || [],
  creator,
  invitedAttendees: template?.template.invitedAttendees || [],
  invitedGroups: template?.template.invitedGroups || [],
  participatedAttendees: template?.template.participatedAttendees || [],
  saveNo: 0,
  answers: [],
  createdAt: new Date(),
  expires: null,
  isAnonymous: template?.template.isAnonymous ?? false,
  canSubmitMultipleAnswers: template?.template.canSubmitMultipleAnswers ?? false,
  isPublic: template?.template.isPublic ?? false,
  canUpdateFormerAnswer: template?.template.canUpdateFormerAnswer ?? false,
});

export default getInitialSurveyFormByTemplate;
