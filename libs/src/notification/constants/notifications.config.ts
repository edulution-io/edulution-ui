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

import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';

const notificationsConfig = {
  conference: {
    started: (name: string, meetingID: string) => ({
      title: `Conference started: ${name}`,
      body: `The conference "${name}" has started.`,
      translate: true,
      data: {
        meetingID,
        type: 'conference_started' as const,
      },
    }),
  },
  bulletin: {
    ready: (title: string, bulletinId: string) => ({
      title: `Bulletin ready: ${title}`,
      body: `The bulletin "${title}" is now available.`,
      translate: true,
      data: {
        bulletinId,
        type: SSE_MESSAGE_TYPE.BULLETIN_UPDATED,
      },
    }),
  },
  survey: {
    created: (title: string, surveyId: string) => ({
      title: `Survey created: ${title}`,
      body: `The survey "${title}" has just been created.`,
      translate: true,
      data: {
        surveyId,
        type: SSE_MESSAGE_TYPE.SURVEY_CREATED,
      },
    }),
    updated: (title: string, surveyId: string) => ({
      title: `Survey updated: ${title}`,
      body: `The survey "${title}" has just been updated.`,
      translate: true,
      data: {
        surveyId,
        type: SSE_MESSAGE_TYPE.SURVEY_UPDATED,
      },
    }),
  },
};

export default notificationsConfig;
