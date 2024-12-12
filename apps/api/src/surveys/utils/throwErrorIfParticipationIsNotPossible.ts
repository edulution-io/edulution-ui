import { HttpStatus } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';

import { Survey } from '../survey.schema';
import Attendee from '../../conferences/attendee.schema';

const throwErrorIfParticipationIsNotPossible = (survey: Survey, username?: string, isPublic?: boolean): void => {
  const { expires = false, canSubmitMultipleAnswers = false } = survey;
  if (expires && expires < new Date()) {
    throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorSurveyExpired, HttpStatus.UNAUTHORIZED);
  }

  if (username && !isPublic) {
    const hasParticipated = survey.participatedAttendees.find(
      (participant: Attendee) => participant.username === username,
    );
    if (hasParticipated && !canSubmitMultipleAnswers) {
      throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorAlreadyParticipated, HttpStatus.FORBIDDEN);
    }

    const isCreator = survey.creator.username === username;
    const isAttendee = survey.invitedAttendees.find((participant: Attendee) => participant.username === username);
    const canParticipate = isCreator || !!isAttendee;
    if (!canParticipate) {
      throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorUserNotAssigned, HttpStatus.UNAUTHORIZED);
    }
  }
};

export default throwErrorIfParticipationIsNotPossible;
