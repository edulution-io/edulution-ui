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

const ExtendedOptionKeys = {
  ONLY_OFFICE_URL: 'ONLY_OFFICE_URL',
  ONLY_OFFICE_JWT_SECRET: 'ONLY_OFFICE_JWT_SECRET',
  MAIL_IMAP_URL: 'MAIL_IMAP_URL',
  MAIL_IMAP_PORT: 'MAIL_IMAP_PORT',
  MAIL_IMAP_SECURE: 'MAIL_IMAP_SECURE',
  MAIL_IMAP_TLS_REJECT_UNAUTHORIZED: 'MAIL_IMAP_TLS_REJECT_UNAUTHORIZED',
  BULLETIN_BOARD_CATEGORY_TABLE: 'BULLETIN_BOARD_CATEGORY_TABLE',
  VEYON_PROXYS: 'VEYON_PROXYS',
  DOCKER_CONTAINER_TABLE: 'DOCKER_CONTAINER_TABLE',
  OVERRIDE_FILE_SHARING_DOCUMENT_VENDOR_MS_WITH_OO: 'OVERRIDE_FILE_SHARING_DOCUMENT_VENDOR_MS_WITH_OO',
  EMBEDDED_PAGE_HTML_CONTENT: 'EMBEDDED_PAGE_HTML_CONTENT',
  EMBEDDED_PAGE_HTML_MODE: 'EMBEDDED_PAGE_HTML_MODE',
  EMBEDDED_PAGE_TABLE: 'EMBEDDED_PAGE_TABLE',
  WEBDAV_SHARE_TABLE: 'WEBDAV_SHARE_TABLE',
} as const;

export default ExtendedOptionKeys;
