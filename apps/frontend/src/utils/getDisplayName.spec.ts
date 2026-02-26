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

vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));

import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariant';
import APPS from '@libs/appconfig/constants/apps';
import getDisplayName from './getDisplayName';

describe('getDisplayName', () => {
  it('returns sidebarLmn key for LINUXMUSTER in school environment', () => {
    const item = { name: APPS.LINUXMUSTER };
    expect(getDisplayName(item, 'en', true)).toBe('linuxmuster.sidebarLmn');
  });

  it('returns sidebarGeneric key for LINUXMUSTER in non-school environment', () => {
    const item = { name: APPS.LINUXMUSTER };
    expect(getDisplayName(item, 'en', false)).toBe('linuxmuster.sidebarGeneric');
  });

  it('returns {name}.sidebar key for native app without translations', () => {
    const item = { name: 'mail', appType: APP_INTEGRATION_VARIANT.NATIVE as string };
    expect(getDisplayName(item, 'en')).toBe('mail.sidebar');
  });

  it('returns {name}.sidebar key when no translations provided', () => {
    const item = { name: 'dashboard' };
    expect(getDisplayName(item, 'en')).toBe('dashboard.sidebar');
  });

  it('returns translation for given language when translations are provided', () => {
    const item = {
      name: 'custom-app',
      appType: APP_INTEGRATION_VARIANT.FRAME as string,
      translations: { en: 'Custom App EN', de: 'Custom App DE' },
    };
    expect(getDisplayName(item, 'en')).toBe('Custom App EN');
  });

  it('returns translation for de language', () => {
    const item = {
      name: 'custom-app',
      appType: APP_INTEGRATION_VARIANT.FRAME as string,
      translations: { en: 'Custom App EN', de: 'Custom App DE' },
    };
    expect(getDisplayName(item, 'de')).toBe('Custom App DE');
  });

  it('falls back to item.name when i18n.t returns empty string', () => {
    vi.doMock('@/i18n', () => ({ default: { t: () => '' }, t: () => '' }));
  });

  it('handles LINUXMUSTER without isSchoolEnvironment parameter', () => {
    const item = { name: APPS.LINUXMUSTER };
    expect(getDisplayName(item, 'en')).toBe('linuxmuster.sidebar');
  });
});
