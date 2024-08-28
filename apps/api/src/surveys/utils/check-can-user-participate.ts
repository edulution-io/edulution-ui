import { HttpStatus } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/constants/api/survey-error-messages-enum';
import { Survey } from '../survey.schema';
import Attendee from '../../conferences/attendee.schema';

const checkCanUserParticipate = (survey: Survey, username: string): void => {
  const { canUpdateFormerAnswer, canSubmitMultipleAnswers } = survey;

  const isCreator = survey.creator.username === username;
  const isAttendee = survey.invitedAttendees.find((participant: Attendee) => participant.username === username);
  const canParticipateAtLeastOnce = isCreator || isAttendee;
  if (!canParticipateAtLeastOnce) {
    throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorUserNotAssigned, HttpStatus.UNAUTHORIZED);
  }

  const hasParticipated = survey.participatedAttendees.find(
    (participant: Attendee) => participant.username === username,
  );
  if (hasParticipated && !canSubmitMultipleAnswers && !canUpdateFormerAnswer) {
    throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorAlreadyParticipated, HttpStatus.FORBIDDEN);
  }
};

export default checkCanUserParticipate;
