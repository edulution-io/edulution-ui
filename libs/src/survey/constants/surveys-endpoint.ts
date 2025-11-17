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

import SurveysPageView from '@libs/survey/types/api/page-view';

export const SURVEYS = 'surveys';
export const PUBLIC_SURVEYS = `public-surveys`;

export const OPEN_SURVEYS_PAGE = `${SURVEYS}/${SurveysPageView.OPEN}`;
export const ANSWERED_SURVEYS_PAGE = `${SURVEYS}/${SurveysPageView.ANSWERED}`;
export const CREATED_SURVEYS_PAGE = `${SURVEYS}/${SurveysPageView.CREATED}`;
export const CREATOR_SURVEYS_PAGE = `${SURVEYS}/${SurveysPageView.CREATOR}`;
export const EDIT_SURVEY_PAGE = `${SURVEYS}/${SurveysPageView.EDITOR}`;
export const PARTICIPATE_SURVEY_PAGE = `${SURVEYS}/${SurveysPageView.PARTICIPATION}`;

export const FIND_ONE = 'id';
export const ANSWER = 'answers';
export const RESULT = 'results';
export const FILES = 'files';
export const TEMPLATES = 'templates';
export const CHOICES = 'choices';
export const CAN_PARTICIPATE = 'can-participate';
export const HAS_ANSWERS = 'has-answers';
export const PUBLIC_USER = 'public-user';

export const SURVEY_FIND_ONE_ENDPOINT = `${SURVEYS}/${FIND_ONE}`;
export const SURVEY_CHOICES = `${PUBLIC_SURVEYS}/${CHOICES}`;
export const SURVEY_RESULT_ENDPOINT = `${SURVEYS}/${RESULT}`;
export const SURVEY_FILE_ATTACHMENT_ENDPOINT = `${PUBLIC_SURVEYS}/${FILES}`;
export const SURVEY_TEMP_FILE_ATTACHMENT_ENDPOINT = `${SURVEYS}/${FILES}`;
export const SURVEY_TEMPLATES_ENDPOINT = `${SURVEYS}/${TEMPLATES}`;
export const SURVEY_CAN_PARTICIPATE_ENDPOINT = `${SURVEYS}/${CAN_PARTICIPATE}`;
export const SURVEY_HAS_ANSWERS_ENDPOINT = `${SURVEYS}/${HAS_ANSWERS}`;
export const SURVEYS_ANSWER_TEMP_FILE_ATTACHMENT_ENDPOINT = `${PUBLIC_SURVEYS}/${ANSWER}/${FILES}`;

export const SURVEY_ANSWER_ENDPOINT = `${SURVEYS}/${ANSWER}`;
export const PUBLIC_SURVEY_ANSWER_ENDPOINT = `${PUBLIC_SURVEYS}/${ANSWER}`;
