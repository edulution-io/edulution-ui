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

const createJwtUser = (overrides: Partial<JwtUser> = {}): JwtUser => ({
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
  jti: 'test-jti-001',
  iss: 'https://keycloak.schule.de/realms/edulution',
  sub: 'test-sub-001',
  typ: 'Bearer',
  azp: 'edulution-ui',
  session_state: 'test-session-001',
  resource_access: {},
  scope: 'openid profile email',
  sid: 'test-sid-001',
  email_verified: true,
  name: 'Max Mueller',
  preferred_username: 'lehrer.mueller',
  given_name: 'Max',
  family_name: 'Mueller',
  email: 'lehrer.mueller@schule.de',
  school: 'default-school',
  ldapGroups: ['cn=teachers,ou=groups,dc=schule,dc=de'],
  ...overrides,
});

export default createJwtUser;
