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

import APPS from '@libs/appconfig/constants/apps';

const CHAT_PATH = APPS.CHAT;

const CHAT_GROUP_TYPE_LOCATIONS = {
  CLASSES: 'classes',
  PROJECTS: 'projects',
  GROUPS: 'groups',
  DIRECT: 'direct',
} as const;

const CHAT_CLASSES_LOCATION = CHAT_GROUP_TYPE_LOCATIONS.CLASSES;
const CHAT_PROJECTS_LOCATION = CHAT_GROUP_TYPE_LOCATIONS.PROJECTS;
const CHAT_GROUPS_LOCATION = CHAT_GROUP_TYPE_LOCATIONS.GROUPS;
const CHAT_DIRECT_LOCATION = CHAT_GROUP_TYPE_LOCATIONS.DIRECT;

const CHAT_CLASSES_PATH = `${CHAT_PATH}/${CHAT_CLASSES_LOCATION}`;
const CHAT_PROJECTS_PATH = `${CHAT_PATH}/${CHAT_PROJECTS_LOCATION}`;
const CHAT_GROUPS_PATH = `${CHAT_PATH}/${CHAT_GROUPS_LOCATION}`;
const CHAT_DIRECT_PATH = `${CHAT_PATH}/${CHAT_DIRECT_LOCATION}`;

export {
  CHAT_PATH,
  CHAT_GROUP_TYPE_LOCATIONS,
  CHAT_CLASSES_LOCATION,
  CHAT_PROJECTS_LOCATION,
  CHAT_GROUPS_LOCATION,
  CHAT_DIRECT_LOCATION,
  CHAT_CLASSES_PATH,
  CHAT_PROJECTS_PATH,
  CHAT_GROUPS_PATH,
  CHAT_DIRECT_PATH,
};
