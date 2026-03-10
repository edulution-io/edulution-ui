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

/* eslint-disable import/no-extraneous-dependencies */
import { http, HttpResponse } from 'msw';

const EDU_API_BASE = '/edu-api';

const fileSharingHandlers = [
  http.get(`${EDU_API_BASE}/filesharing`, () =>
    HttpResponse.json([
      { filename: 'document.pdf', basename: 'document.pdf', type: 'file', size: 1024, lastmod: '2025-01-01' },
      { filename: 'images/', basename: 'images', type: 'directory', size: 0, lastmod: '2025-01-02' },
    ]),
  ),

  http.get(`${EDU_API_BASE}/webdav-shares`, () =>
    HttpResponse.json([
      { name: 'share1', displayName: 'Share 1', path: '/share1' },
      { name: 'share2', displayName: 'Share 2', path: '/share2' },
    ]),
  ),
];

export default fileSharingHandlers;
