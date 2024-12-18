import sortString from '@libs/common/utils/sortString';
import SurveyDto from '@libs/survey/types/api/survey.dto';

const sortSurveyByTitle = (a: SurveyDto, b: SurveyDto): number => {
  const surveyTitleA = a.formula.title;
  const surveyTitleB = b.formula.title;
  return sortString(surveyTitleA, surveyTitleB);
};

export default sortSurveyByTitle;
