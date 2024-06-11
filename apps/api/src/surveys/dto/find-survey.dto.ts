import UserSurveySearchTypes from '../types/user-survey-search-types-enum.ts';

class FindSurveyDto {
  surveyId?: string;

  surveyIds?: number[];

  username?: string;

  search?: UserSurveySearchTypes;

  isAnonymous?: boolean;

  participants?: string[];
}

export default FindSurveyDto;
