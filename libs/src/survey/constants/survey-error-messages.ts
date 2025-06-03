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

enum SurveyErrorMessages {
  UpdateOrCreateError = 'survey.errors.updateOrCreateError',
  DeleteError = 'survey.errors.deleteError',
  NoAnswers = 'survey.errors.noAnswerError',
  NoFormula = 'survey.errors.noFormulaError',
  NoBackendLimiters = 'survey.errors.noBackendLimitersError',
  NotFoundError = 'survey.errors.notFoundError',
  MISSING_ID_ERROR = 'survey.errors.missingIdError',
  SurveyFormulaStructuralError = 'survey.errors.surveyFormulaStructuralError',
  ParticipationErrorUserNotAssigned = 'survey.errors.participationErrorUserNotAssigned',
  ParticipationErrorSurveyExpired = 'survey.errors.participationErrorSurveyExpired',
  ParticipationErrorAlreadyParticipated = 'survey.errors.participationErrorAlreadyParticipated',
}

export default SurveyErrorMessages;
