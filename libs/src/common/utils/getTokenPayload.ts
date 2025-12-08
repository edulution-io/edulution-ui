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

import JwtUser from '@libs/user/types/jwt/jwtUser';
import { decodeBase64 } from './getBase64String';
import { decodeBase64Api } from './getBase64StringApi';

const getTokenPayload = (token: string): JwtUser => {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');

  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');

  const json = typeof window !== 'undefined' ? decodeBase64(base64) : decodeBase64Api(base64);

  return JSON.parse(json) as JwtUser;
};

export default getTokenPayload;
