import UserSurveySearchTypes from '@libs/survey/types/user-survey-search-types-enum';

class FindSurveyDto {
  surveyId?: number;

  surveyIds?: number[];

  username?: string;

  search?: UserSurveySearchTypes;

  isAnonymous?: boolean;

  participants?: string[];
}

export default FindSurveyDto;
