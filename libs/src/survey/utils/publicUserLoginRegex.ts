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

export const usernameRegex = '[ßÄÖÜäöüa-zA-Z0-9.\\-\\s]{1,20}';

export const publicUserNameRegex = new RegExp(`^${usernameRegex}$`);

export const publicUserPrefix = 'publicUserLogin';

export const publicUserSeperator = '_';

export const uuidRegex = '[a-f0-9.\\-]{1,36}';

export const userLoginRegex = `^${publicUserPrefix}${publicUserSeperator}${usernameRegex}${publicUserSeperator}${uuidRegex}`;

export const publicUserLoginRegex = new RegExp(`^${userLoginRegex}$`);

export const createNewPublicUserLogin = (publicUserName: string, publicUserId: string) =>
  `${publicUserPrefix}${publicUserSeperator}${publicUserName}${publicUserSeperator}${publicUserId}`;

export const publicUserRegex = new RegExp(`${publicUserNameRegex.source}|${publicUserLoginRegex.source}`);
