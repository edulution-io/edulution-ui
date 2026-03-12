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
import ParseJsonPipe from './parseJson.pipe';

describe(ParseJsonPipe.name, () => {
  let pipe: ParseJsonPipe;

  beforeEach(() => {
    pipe = new ParseJsonPipe();
  });

  it('should parse a valid JSON object string', () => {
    const result = pipe.transform('{"key": "value"}');
    expect(result).toEqual({ key: 'value' });
  });

  it('should parse a valid JSON array string', () => {
    const result = pipe.transform('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('should parse a JSON string with nested objects', () => {
    const result = pipe.transform('{"a": {"b": 1}}');
    expect(result).toEqual({ a: { b: 1 } });
  });

  it('should throw BadRequestException for invalid JSON', () => {
    expect(() => pipe.transform('not json')).toThrow(BadRequestException);
  });

  it('should throw BadRequestException with correct message for invalid JSON', () => {
    expect(() => pipe.transform('{')).toThrow('Invalid JSON in dto field');
  });

  it('should throw BadRequestException for an empty string', () => {
    expect(() => pipe.transform('')).toThrow(BadRequestException);
  });

  it('should parse a JSON number string', () => {
    const result = pipe.transform('42');
    expect(result).toBe(42);
  });

  it('should parse a JSON boolean string', () => {
    const result = pipe.transform('true');
    expect(result).toBe(true);
  });

  it('should parse a JSON null string', () => {
    const result = pipe.transform('null');
    expect(result).toBeNull();
  });
});
