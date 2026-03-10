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

import sanitizePath from './sanitizePath';

describe('sanitizePath', () => {
  it.each([
    {
      description: 'removes .. sequences',
      input: 'some/../path',
      expected: 'some/path',
    },
    {
      description: 'collapses multiple slashes to one',
      input: 'some///path',
      expected: 'some/path',
    },
    {
      description: 'strips leading slash',
      input: '/some/path',
      expected: 'some/path',
    },
    {
      description: 'removes special characters',
      input: 'some/path with spaces!@#$%',
      expected: 'some/pathwithspaces',
    },
    {
      description: 'keeps valid characters (a-zA-Z0-9._-/)',
      input: 'valid-file_name.2024/sub.dir',
      expected: 'valid-file_name.2024/sub.dir',
    },
    {
      description: 'returns empty string for empty input',
      input: '',
      expected: '',
    },
    {
      description: 'handles combination of all edge cases',
      input: '/../some///bad path!/../file.txt',
      expected: 'some/badpath/file.txt',
    },
    {
      description: 'removes directory traversal attempts',
      input: '../../etc/passwd',
      expected: 'etc/passwd',
    },
    {
      description: 'handles only special characters',
      input: '!@#$%^&*()',
      expected: '',
    },
  ])('$description', ({ input, expected }) => {
    expect(sanitizePath(input)).toBe(expected);
  });
});
