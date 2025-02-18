/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { type ContainerInfo } from 'dockerode';
import type CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import type SurveyDto from '@libs/survey/types/api/survey.dto';
import type ConferenceDto from '@libs/conferences/types/conference.dto';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import { type Survey } from '../surveys/survey.schema';
import { type Conference } from '../conferences/conference.schema';
import { BulletinDocument } from '../bulletinboard/bulletin.schema';

type SseEventData =
  | string
  | string[]
  | CreateConferenceDto
  | ConferenceDto
  | SurveyDto
  | Survey
  | Conference
  | DockerEvent
  | ContainerInfo[]
  | BulletinDocument;

export default SseEventData;
