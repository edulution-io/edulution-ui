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

interface UserDocument {
  filename: string;
  basename: string;
  lastmod: string;
  size: number;
  type: string;
  mime?: string;
  etag?: string;
}

const USER_DOCUMENT_DEFAULTS: UserDocument = {
  filename: '/webdav/default-school/teachers/max.mustermann/Dokumente/Arbeitsblatt.pdf',
  basename: 'Arbeitsblatt.pdf',
  lastmod: '2026-02-26T10:00:00Z',
  size: 102400,
  type: 'file',
  mime: 'application/pdf',
  etag: '"abc123"',
};

const createUserDocument = (overrides: Partial<UserDocument> = {}): UserDocument => ({
  ...USER_DOCUMENT_DEFAULTS,
  ...overrides,
});

export type { UserDocument };
export default createUserDocument;
