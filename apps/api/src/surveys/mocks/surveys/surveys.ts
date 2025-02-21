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
