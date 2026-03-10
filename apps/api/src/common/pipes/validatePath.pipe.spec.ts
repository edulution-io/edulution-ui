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
import ValidatePathPipe from './validatePath.pipe';

describe(ValidatePathPipe.name, () => {
  const basePath = '/srv/public';
  let pipe: ValidatePathPipe;

  beforeEach(() => {
    pipe = new ValidatePathPipe(basePath);
  });

  it('should return undefined for undefined input', () => {
    const result = pipe.transform(undefined);
    expect(result).toBeUndefined();
  });

  it('should return undefined for null input', () => {
    const result = pipe.transform(null as unknown as undefined);
    expect(result).toBeUndefined();
  });

  it('should return a sanitized path for a valid string', () => {
    const result = pipe.transform('documents/report.pdf');
    expect(result).toBe('documents/report.pdf');
  });

  it('should strip path traversal sequences from the input', () => {
    const result = pipe.transform('../../etc/passwd');
    expect(result).not.toContain('..');
  });

  it('should throw BadRequestException for an empty string', () => {
    expect(() => pipe.transform('')).toThrow(BadRequestException);
  });

  it('should throw BadRequestException with IsEmpty message for whitespace-only string', () => {
    expect(() => pipe.transform('   ')).toThrow(PathValidationErrorMessages.IsEmpty);
  });

  it('should sanitize traversal sequences so the result stays within the base directory', () => {
    const result = pipe.transform('valid/../../../outside');
    expect(result).not.toContain('..');
    expect(typeof result).toBe('string');
  });

  it('should join array values and validate the result', () => {
    const result = pipe.transform(['documents', 'report.pdf']);
    expect(result).toBe('documents/report.pdf');
  });

  it('should throw BadRequestException for a path exceeding max length', () => {
    const longPath = 'a'.repeat(301);
    expect(() => pipe.transform(longPath)).toThrow(PathValidationErrorMessages.PathTooLong);
  });
});
