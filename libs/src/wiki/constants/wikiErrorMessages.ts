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

const WIKI_ERROR_MESSAGES = {
  WIKI_NOT_FOUND: 'wiki.errors.wikiNotFound',
  WIKI_ALREADY_EXISTS: 'wiki.errors.wikiAlreadyExists',
  WIKI_CREATION_FAILED: 'wiki.errors.wikiCreationFailed',
  WIKI_DELETION_FAILED: 'wiki.errors.wikiDeletionFailed',
  PAGE_NOT_FOUND: 'wiki.errors.pageNotFound',
  PAGE_CREATION_FAILED: 'wiki.errors.pageCreationFailed',
  PAGE_UPDATE_FAILED: 'wiki.errors.pageUpdateFailed',
  PAGE_DELETION_FAILED: 'wiki.errors.pageDeletionFailed',
  CONTENT_READ_FAILED: 'wiki.errors.contentReadFailed',
  ACCESS_DENIED: 'wiki.errors.accessDenied',
} as const;

export default WIKI_ERROR_MESSAGES;
