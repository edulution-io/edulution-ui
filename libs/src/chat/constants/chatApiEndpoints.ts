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

export const CHAT_EDU_API_ENDPOINT = APPS.CHAT;

export const CHAT_USER_GROUPS_ENDPOINT = `${CHAT_EDU_API_ENDPOINT}/groups`;

export const CHAT_CONVERSATIONS_ENDPOINT = `${CHAT_EDU_API_ENDPOINT}/conversations`;

export const CHAT_PROFILE_PICTURES_ENDPOINT = `${CHAT_EDU_API_ENDPOINT}/profile-pictures`;

export const getChatMessagesEndpoint = (conversationType: string, groupName: string): string =>
  `${CHAT_CONVERSATIONS_ENDPOINT}/${conversationType}/${encodeURIComponent(groupName)}/messages`;
