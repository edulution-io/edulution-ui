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

import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import getCustomAppConfigFormSchema from './getCustomAppConfigFormSchema';

const t = (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key);

describe('getCustomAppConfigFormSchema', () => {
  const emptyAppConfigs: AppConfigDto[] = [];

  const existingAppConfigs = [{ name: 'existingapp', translations: { en: 'Existing App' } }] as AppConfigDto[];

  it('accepts valid customAppName and customIcon', () => {
    const schema = getCustomAppConfigFormSchema(t as never, emptyAppConfigs);
    const result = schema.safeParse({
      customAppName: 'MyNewApp',
      customIcon: 'fa-star',
    });

    expect(result.success).toBe(true);
  });

  it('fails when customAppName is empty', () => {
    const schema = getCustomAppConfigFormSchema(t as never, emptyAppConfigs);
    const result = schema.safeParse({
      customAppName: '',
      customIcon: 'fa-star',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('settings.errors.fieldRequired');
    }
  });

  it('fails when customAppName exceeds 20 characters', () => {
    const schema = getCustomAppConfigFormSchema(t as never, emptyAppConfigs);
    const result = schema.safeParse({
      customAppName: 'a'.repeat(21),
      customIcon: 'fa-star',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes('settings.errors.maxChars'))).toBe(true);
    }
  });

  it('fails when customAppName matches a forbidden route', () => {
    const schema = getCustomAppConfigFormSchema(t as never, emptyAppConfigs);
    const result = schema.safeParse({
      customAppName: 'auth',
      customIcon: 'fa-star',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('settings.errors.nameIsNotAllowed');
    }
  });

  it('fails when customAppName matches existing app name after slugify', () => {
    const schema = getCustomAppConfigFormSchema(t as never, existingAppConfigs);
    const result = schema.safeParse({
      customAppName: 'existingapp',
      customIcon: 'fa-star',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('settings.errors.nameAlreadyExists');
    }
  });

  it('fails when customAppName matches existing display name', () => {
    const schema = getCustomAppConfigFormSchema(t as never, existingAppConfigs);
    const result = schema.safeParse({
      customAppName: 'Existing App',
      customIcon: 'fa-star',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('settings.errors.nameAlreadyExists');
    }
  });

  it('fails when customIcon is empty', () => {
    const schema = getCustomAppConfigFormSchema(t as never, emptyAppConfigs);
    const result = schema.safeParse({
      customAppName: 'ValidName',
      customIcon: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('settings.errors.fieldRequired');
    }
  });
});
