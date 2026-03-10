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

const mailHandlers = [
  http.get(`${EDU_API_BASE}/mails`, () =>
    HttpResponse.json([
      { id: 'mail-1', subject: 'Test Mail 1', from: 'alice@test.de', to: 'bob@test.de', date: '2025-01-01' },
      { id: 'mail-2', subject: 'Test Mail 2', from: 'bob@test.de', to: 'alice@test.de', date: '2025-01-02' },
    ]),
  ),

  http.get(`${EDU_API_BASE}/mails/provider-config`, () =>
    HttpResponse.json([{ id: 'provider-1', host: 'imap.test.de', port: 993, username: 'user@test.de' }]),
  ),

  http.post(`${EDU_API_BASE}/mails/provider-config`, () =>
    HttpResponse.json([
      { id: 'provider-1', host: 'imap.test.de', port: 993, username: 'user@test.de' },
      { id: 'provider-2', host: 'imap.other.de', port: 993, username: 'other@test.de' },
    ]),
  ),

  http.delete(`${EDU_API_BASE}/mails/provider-config/:id`, () => HttpResponse.json([])),

  http.get(`${EDU_API_BASE}/mails/sync-job`, () =>
    HttpResponse.json([{ id: 'sync-1', mailProviderId: 'provider-1', status: 'active' }]),
  ),

  http.post(`${EDU_API_BASE}/mails/sync-job`, () =>
    HttpResponse.json([
      { id: 'sync-1', mailProviderId: 'provider-1', status: 'active' },
      { id: 'sync-2', mailProviderId: 'provider-2', status: 'active' },
    ]),
  ),

  http.delete(`${EDU_API_BASE}/mails/sync-job`, () => HttpResponse.json([])),
];

export default mailHandlers;
