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
const LMN_API = `${EDU_API_BASE}/lmn-api`;

const classManagementHandlers = [
  http.get(`${LMN_API}/school-classes`, () =>
    HttpResponse.json([
      { cn: '10a', dn: 'cn=10a,ou=classes', displayName: 'Klasse 10a' },
      { cn: '10b', dn: 'cn=10b,ou=classes', displayName: 'Klasse 10b' },
    ]),
  ),

  http.get(`${LMN_API}/school-classes/:name`, () =>
    HttpResponse.json({
      cn: '10a',
      dn: 'cn=10a,ou=classes',
      displayName: 'Klasse 10a',
      members: [{ cn: 'student1', displayName: 'Student One' }],
    }),
  ),

  http.get(`${LMN_API}/projects`, () =>
    HttpResponse.json([{ cn: 'project-alpha', dn: 'cn=project-alpha,ou=projects', displayName: 'Project Alpha' }]),
  ),

  http.get(`${LMN_API}/projects/:name`, () =>
    HttpResponse.json({
      cn: 'project-alpha',
      dn: 'cn=project-alpha,ou=projects',
      displayName: 'Project Alpha',
      members: [{ cn: 'member1', displayName: 'Member One' }],
    }),
  ),

  http.get(`${LMN_API}/sessions`, () => HttpResponse.json([{ sid: 'session-1', name: 'Session A', members: [] }])),

  http.get(`${LMN_API}/room`, () => HttpResponse.json({ name: 'Room 101', members: [{ cn: 'student1' }] })),

  http.get(`${LMN_API}/printers`, () => HttpResponse.json([{ cn: 'printer-1', displayName: 'Printer A' }])),

  http.get(`${LMN_API}/search`, () =>
    HttpResponse.json([{ cn: 'user1', dn: 'cn=user1,ou=users', displayName: 'User One', type: 'user' }]),
  ),

  http.get(`${LMN_API}/schools`, () => HttpResponse.json([{ name: 'default-school', displayName: 'Default School' }])),
];

export default classManagementHandlers;
