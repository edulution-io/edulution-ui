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

import { BadRequestException } from '@nestjs/common';
import PathValidationErrorMessages from '@libs/common/constants/path-validation-error-messages';
import validatePath from './validatePath';

const BASE_PATH = '/test/base';

describe(validatePath.name, () => {
  describe('valid inputs', () => {
    it('should return a sanitized filename for a simple input', () => {
      expect(validatePath(BASE_PATH, 'file.png')).toBe('file.png');
    });

    it('should join and validate array input', () => {
      expect(validatePath(BASE_PATH, ['subfolder', 'file.png'])).toBe('subfolder/file.png');
    });

    it('should trim whitespace from the value', () => {
      expect(validatePath(BASE_PATH, '  file.png  ')).toBe('file.png');
    });

    it('should accept paths within subdirectories', () => {
      expect(validatePath(BASE_PATH, 'sub/dir/file.txt')).toBe('sub/dir/file.txt');
    });
  });

  describe('error cases', () => {
    it('should throw NoString for null input', () => {
      expect(() => validatePath(BASE_PATH, null)).toThrow(BadRequestException);
      expect(() => validatePath(BASE_PATH, null)).toThrow(PathValidationErrorMessages.NoString);
    });

    it('should throw IsEmpty for empty string', () => {
      expect(() => validatePath(BASE_PATH, '')).toThrow(BadRequestException);
      expect(() => validatePath(BASE_PATH, '')).toThrow(PathValidationErrorMessages.IsEmpty);
    });

    it('should throw IsEmpty for whitespace-only string', () => {
      expect(() => validatePath(BASE_PATH, '   ')).toThrow(BadRequestException);
      expect(() => validatePath(BASE_PATH, '   ')).toThrow(PathValidationErrorMessages.IsEmpty);
    });

    it('should throw PathTooLong for paths exceeding 300 characters', () => {
      const longPath = 'a'.repeat(301);
      expect(() => validatePath(BASE_PATH, longPath)).toThrow(BadRequestException);
      expect(() => validatePath(BASE_PATH, longPath)).toThrow(PathValidationErrorMessages.PathTooLong);
    });
  });

  describe('security', () => {
    it('should sanitize path traversal attempts and keep result within base', () => {
      const result = validatePath(BASE_PATH, '../../../etc/passwd');
      expect(result).not.toContain('..');
      expect(result).toBe('etc/passwd');
    });

    it('should strip special characters from the path', () => {
      const result = validatePath(BASE_PATH, 'file name!@#$.png');
      expect(result).toBe('filename.png');
    });

    it('should remove leading slashes from absolute paths', () => {
      const result = validatePath(BASE_PATH, '/subfolder/file.png');
      expect(result).toBe('subfolder/file.png');
    });

    it('should handle a path at exactly 300 characters', () => {
      const exactPath = 'a'.repeat(300);
      expect(() => validatePath(BASE_PATH, exactPath)).not.toThrow();
    });
  });
});
