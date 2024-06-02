import UserSurveySearchTypes from '../types/user-survey-search-types-enum';

class FindSurveyDto {
  surveyname?: string;

  surveynames?: string[];

  username?: string;

  search?: UserSurveySearchTypes;

  isAnonymous?: boolean;

  participants?: string[];
}

export default FindSurveyDto;
