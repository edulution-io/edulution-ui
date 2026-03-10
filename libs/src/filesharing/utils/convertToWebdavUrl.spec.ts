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

import convertToWebdavUrl from './convertToWebdavUrl';

describe('convertToWebdavUrl', () => {
  it.each([
    {
      description: 'converts https:// to davs://',
      input: 'https://example.com/path',
      expected: 'davs://example.com/path',
    },
    {
      description: 'converts http:// to dav://',
      input: 'http://example.com/path',
      expected: 'dav://example.com/path',
    },
    {
      description: 'returns empty string for empty input',
      input: '',
      expected: '',
    },
    {
      description: 'leaves other protocols unchanged',
      input: 'ftp://example.com/path',
      expected: 'ftp://example.com/path',
    },
    {
      description: 'handles https URL without path',
      input: 'https://example.com',
      expected: 'davs://example.com',
    },
    {
      description: 'handles http URL with port',
      input: 'http://example.com:8080/path',
      expected: 'dav://example.com:8080/path',
    },
    {
      description: 'handles https URL with query parameters',
      input: 'https://example.com/path?key=value',
      expected: 'davs://example.com/path?key=value',
    },
  ])('$description', ({ input, expected }) => {
    expect(convertToWebdavUrl(input)).toBe(expected);
  });
});
