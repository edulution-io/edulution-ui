import { HttpStatus } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/constants/api/survey-error-messages-enum';
import { Survey } from '../survey.schema';

const checkIsSurveyExpired = (survey: Survey): void => {
  const { expires } = survey;
  if (expires) {
    const isExpired = expires < new Date();
    if (isExpired) {
      throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorSurveyExpired, HttpStatus.UNAUTHORIZED);
    }
  }
};

export default checkIsSurveyExpired;
