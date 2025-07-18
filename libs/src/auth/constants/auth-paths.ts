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
