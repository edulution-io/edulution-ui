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

import { createdSurvey01, createdSurveyId01, createdSurvey02, createdSurveyId02 } from './created-surveys';
import { openSurveyId02, openSurvey01, openSurvey02, openSurveyId01 } from './open-surveys';
import { surveyUpdateSurveyId, surveyUpdateUpdatedSurvey } from './updated-survey';
import {
  answeredSurvey01,
  answeredSurvey02,
  answeredSurvey03,
  answeredSurvey05,
  answeredSurvey04,
  idOfAnsweredSurvey01,
  idOfAnsweredSurvey02,
  idOfAnsweredSurvey03,
  idOfAnsweredSurvey05,
  idOfAnsweredSurvey04,
} from './answered-surveys';

export const mockedSurveyIds = [
  surveyUpdateSurveyId,
  createdSurveyId01,
  createdSurveyId02,
  openSurveyId01,
  openSurveyId02,
  idOfAnsweredSurvey01,
  idOfAnsweredSurvey02,
  idOfAnsweredSurvey03,
  idOfAnsweredSurvey05,
  idOfAnsweredSurvey04,
];

export const mockedSurveys = [
  surveyUpdateUpdatedSurvey,
  createdSurvey01,
  createdSurvey02,
  openSurvey01,
  openSurvey02,
  answeredSurvey01,
  answeredSurvey02,
  answeredSurvey03,
  answeredSurvey05,
  answeredSurvey04,
];
