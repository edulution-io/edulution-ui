import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { Conference } from '../conferences/conference.schema';
import { Survey } from '../surveys/survey.schema';

type SseEventData = string | string[] | CreateConferenceDto | Conference | SurveyDto | Survey;

export default SseEventData;
