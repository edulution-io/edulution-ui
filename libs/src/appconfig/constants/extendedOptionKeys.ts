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

const ExtendedOptionKeys = {
  ONLY_OFFICE_URL: 'ONLY_OFFICE_URL',
  ONLY_OFFICE_JWT_SECRET: 'ONLY_OFFICE_JWT_SECRET',
  MAIL_IMAP_URL: 'MAIL_IMAP_URL',
  MAIL_IMAP_PORT: 'MAIL_IMAP_PORT',
  MAIL_IMAP_SECURE: 'MAIL_IMAP_SECURE',
  MAIL_IMAP_TLS_REJECT_UNAUTHORIZED: 'MAIL_IMAP_TLS_REJECT_UNAUTHORIZED',
  MAIL_SOGO_THEME: 'MAIL_SOGO_THEME',
  MAIL_SOGO_THEME_UPDATE_CHECKER: 'MAIL_SOGO_THEME_UPDATE_CHECKER',
  BULLETIN_BOARD_CATEGORY_TABLE: 'BULLETIN_BOARD_CATEGORY_TABLE',
  VEYON_PROXYS: 'VEYON_PROXYS',
  DOCKER_CONTAINER_TABLE: 'DOCKER_CONTAINER_TABLE',
  OVERRIDE_FILE_SHARING_DOCUMENT_VENDOR_MS_WITH_OO: 'OVERRIDE_FILE_SHARING_DOCUMENT_VENDOR_MS_WITH_OO',
  EMBEDDED_PAGE_HTML_CONTENT: 'EMBEDDED_PAGE_HTML_CONTENT',
  EMBEDDED_PAGE_HTML_MODE: 'EMBEDDED_PAGE_HTML_MODE',
  EMBEDDED_PAGE_TABLE: 'EMBEDDED_PAGE_TABLE',
  EMBEDDED_PAGE_IS_PUBLIC: 'EMBEDDED_PAGE_IS_PUBLIC',
  WEBDAV_SERVER_TABLE: 'WEBDAV_SERVER_TABLE',
  WEBDAV_SHARE_TABLE: 'WEBDAV_SHARE_TABLE',
} as const;

export default ExtendedOptionKeys;
