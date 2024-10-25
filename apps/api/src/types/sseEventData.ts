import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import { Survey } from '../surveys/survey.schema';
import { Conference } from '../conferences/conference.schema';

type SseEventData = string | string[] | CreateConferenceDto | ConferenceDto | SurveyDto | Survey | Conference;

export default SseEventData;
