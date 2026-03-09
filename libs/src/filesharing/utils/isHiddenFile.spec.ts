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

import isHiddenFile from './isHiddenFile';

describe('isHiddenFile', () => {
  it('returns true for dot-prefixed files', () => {
    expect(isHiddenFile('.gitignore')).toBe(true);
    expect(isHiddenFile('.env')).toBe(true);
    expect(isHiddenFile('.hidden')).toBe(true);
  });

  it('returns true for dot-prefixed files in a path', () => {
    expect(isHiddenFile('/home/user/.bashrc')).toBe(true);
    expect(isHiddenFile('some/path/.config')).toBe(true);
  });

  it('returns false for regular files', () => {
    expect(isHiddenFile('readme.md')).toBe(false);
    expect(isHiddenFile('document.txt')).toBe(false);
  });

  it('returns false for underscore-prefixed files', () => {
    expect(isHiddenFile('_helper.ts')).toBe(false);
    expect(isHiddenFile('/path/_partial.scss')).toBe(false);
  });

  it('returns false for dot and double-dot entries', () => {
    expect(isHiddenFile('.')).toBe(false);
    expect(isHiddenFile('..')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isHiddenFile('')).toBe(false);
  });

  it('returns false for paths ending with slash', () => {
    expect(isHiddenFile('path/to/')).toBe(false);
  });

  it('returns false for regular files nested in hidden directories', () => {
    expect(isHiddenFile('.hidden/visible.txt')).toBe(false);
  });

  it('returns true for dot-prefixed files nested in regular directories', () => {
    expect(isHiddenFile('regular/.secret')).toBe(true);
  });
});
