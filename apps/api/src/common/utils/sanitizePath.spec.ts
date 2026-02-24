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

import sanitizePath from '@libs/filesystem/utils/sanitizePath';

describe(sanitizePath.name, () => {
  it('should return a normal filename unchanged', () => {
    expect(sanitizePath('file.png')).toBe('file.png');
  });

  it('should remove .. sequences', () => {
    expect(sanitizePath('../../etc/passwd')).toBe('etc/passwd');
  });

  it('should collapse multiple slashes into one', () => {
    expect(sanitizePath('a///b//c')).toBe('a/b/c');
  });

  it('should remove a leading slash', () => {
    expect(sanitizePath('/etc/passwd')).toBe('etc/passwd');
  });

  it('should strip special characters', () => {
    expect(sanitizePath('file name!@#$.png')).toBe('filename.png');
  });

  it('should allow hyphens, underscores, and dots', () => {
    expect(sanitizePath('my-file_v2.tar.gz')).toBe('my-file_v2.tar.gz');
  });

  it('should handle nested path traversal attempts', () => {
    expect(sanitizePath('a/../../../b')).toBe('a/b');
  });

  it('should return empty string for empty input', () => {
    expect(sanitizePath('')).toBe('');
  });

  it('should preserve valid subdirectory paths', () => {
    expect(sanitizePath('sub/dir/file.txt')).toBe('sub/dir/file.txt');
  });

  it('should handle combined traversal and special characters', () => {
    expect(sanitizePath('../../../etc/passwd\x00')).toBe('etc/passwd');
  });
});
