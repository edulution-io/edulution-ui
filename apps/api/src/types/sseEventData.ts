import { type ContainerInfo } from 'dockerode';
import type CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import type SurveyDto from '@libs/survey/types/api/survey.dto';
import type ConferenceDto from '@libs/conferences/types/conference.dto';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import { type Survey } from '../surveys/survey.schema';
import { type Conference } from '../conferences/conference.schema';

type SseEventData =
  | string
  | string[]
  | CreateConferenceDto
  | ConferenceDto
  | SurveyDto
  | Survey
  | Conference
  | DockerEvent
  | ContainerInfo[];

export default SseEventData;
