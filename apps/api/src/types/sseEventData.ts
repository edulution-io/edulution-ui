/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { type ContainerInfo } from 'dockerode';
import type CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import type SurveyDto from '@libs/survey/types/api/survey.dto';
import type ConferenceDto from '@libs/conferences/types/conference.dto';
import type DockerEvent from '@libs/docker/types/dockerEvents';
import DownloadFileDto from '@libs/filesharing/types/downloadFileDto';
import FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import type PullEvent from '@libs/docker/types/pullEvent';
import { type Survey } from '../surveys/survey.schema';
import { type Conference } from '../conferences/conference.schema';
import { BulletinDocument } from '../bulletinboard/bulletin.schema';
import { TLDrawSyncLog } from '../tldraw-sync/tldraw-sync-log.schema';

type SseEventData =
  | string
  | string[]
  | CreateConferenceDto
  | ConferenceDto
  | SurveyDto
  | Survey
  | Conference
  | FilesharingProgressDto
  | DockerEvent
  | ContainerInfo[]
  | DownloadFileDto
  | BulletinDocument
  | TLDrawSyncLog
  | PullEvent;

export default SseEventData;
