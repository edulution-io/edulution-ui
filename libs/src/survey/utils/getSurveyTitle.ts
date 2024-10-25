import i18next from 'i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import convertJSONToSurveyFormula from '@libs/survey/utils/convertJSONToSurveyFormula';

const getSurveyTitle = (survey: SurveyDto): string => {
  const surveyFormula = convertJSONToSurveyFormula(survey.formula || {});
  return surveyFormula?.title || i18next.t('common.not-available');
};

export default getSurveyTitle;
