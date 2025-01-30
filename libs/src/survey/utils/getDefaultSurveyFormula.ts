import i18next from 'i18next';
import TSurveyFormula from '@libs/survey/types/TSurveyFormula';

const getDefaultSurveyFormula = (): TSurveyFormula => ({ title: i18next.t('survey.newTitle').toString() });

export default getDefaultSurveyFormula;
