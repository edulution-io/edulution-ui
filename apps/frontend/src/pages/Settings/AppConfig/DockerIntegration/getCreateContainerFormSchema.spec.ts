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

import getCreateContainerFormSchema from './getCreateContainerFormSchema';

const t = (key: string) => key;

describe('getCreateContainerFormSchema', () => {
  it('returns empty object schema when envPlaceholders is empty', () => {
    const schema = getCreateContainerFormSchema(t as never, {});
    const result = schema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('validates HOSTNAME placeholder against FQDN regex - valid', () => {
    const schema = getCreateContainerFormSchema(t as never, { APP_HOSTNAME: '' });
    const result = schema.safeParse({ APP_HOSTNAME: 'app.example.com' });

    expect(result.success).toBe(true);
  });

  it('validates HOSTNAME placeholder against FQDN regex - invalid', () => {
    const schema = getCreateContainerFormSchema(t as never, { APP_HOSTNAME: '' });
    const result = schema.safeParse({ APP_HOSTNAME: 'not-a-fqdn' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('common.invalid_fqdn');
    }
  });

  it('validates non-HOSTNAME placeholder with min length 1', () => {
    const schema = getCreateContainerFormSchema(t as never, { APP_SECRET: '' });
    const result = schema.safeParse({ APP_SECRET: 'my-secret' });

    expect(result.success).toBe(true);
  });

  it('fails when non-HOSTNAME placeholder is empty string', () => {
    const schema = getCreateContainerFormSchema(t as never, { APP_SECRET: '' });
    const result = schema.safeParse({ APP_SECRET: '' });

    expect(result.success).toBe(false);
  });

  it('handles multiple placeholders of different types', () => {
    const schema = getCreateContainerFormSchema(t as never, {
      APP_HOSTNAME: '',
      APP_SECRET: '',
    });

    const validResult = schema.safeParse({
      APP_HOSTNAME: 'app.example.com',
      APP_SECRET: 'mysecret',
    });
    expect(validResult.success).toBe(true);

    const invalidResult = schema.safeParse({
      APP_HOSTNAME: 'invalid',
      APP_SECRET: '',
    });
    expect(invalidResult.success).toBe(false);
  });
});
