import SurveyDto from '@libs/survey/types/api/survey.dto';
import { Survey } from '../survey.schema';

const convertSurveyDtoToSurvey = (surveyDto: SurveyDto): Survey => {
  const { id, created = new Date() } = surveyDto;

  return {
    ...surveyDto,
    _id: id,
    created,
  };
};

export default convertSurveyDtoToSurvey;
