import UserPollSearchTypes from '../types/user-poll-search-types-enum';

class FindSurveyDto {
  pollName?: string;

  pollNames?: string[];

  username?: string;

  search?: UserPollSearchTypes;
}

export default FindSurveyDto;
