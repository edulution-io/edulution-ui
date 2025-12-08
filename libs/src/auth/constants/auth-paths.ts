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

const AUTH_PATHS = {
  AUTH_ENDPOINT: 'auth',
  AUTH_OIDC_CONFIG_PATH: '/.well-known/openid-configuration',
  AUTH_OIDC_TOKEN_PATH: '/protocol/openid-connect/token',
  AUTH_OIDC_USERINFO_PATH: '/protocol/openid-connect/userinfo',
  AUTH_QRCODE: 'qrcode',
  AUTH_CHECK_TOTP: 'totp',
  AUTH_VIA_APP: 'edu-app',
} as const;

export default AUTH_PATHS;
