import { HttpStatus } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessagesEnum from '@libs/survey/constants/api/survey-error-messages-enum';
import { Survey } from '../survey.schema';

const checkIsSurveyExpired = (survey: Survey): void => {
  const { expires } = survey;
  if (expires) {
    const isExpired = expires < new Date();
    if (isExpired) {
      throw new CustomHttpException(SurveyErrorMessagesEnum.ParticipationErrorSurveyExpired, HttpStatus.UNAUTHORIZED);
    }
  }
};

export default checkIsSurveyExpired;
