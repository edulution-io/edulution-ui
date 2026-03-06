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

vi.mock('@/pages/ForwardingPage/ForwardingPage', () => ({
  default: () => <div data-testid="forwarding-page" />,
}));

import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariant';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import getForwardedAppRoutes from './getForwardedAppRoutes';

describe('getForwardedAppRoutes', () => {
  const createConfig = (name: string, appType: string) =>
    ({
      name,
      appType,
      icon: 'fa-test',
      options: {},
      accessGroups: [],
      position: 0,
    }) as unknown as AppConfigDto;

  it('returns Route elements for FORWARDING type configs', () => {
    const configs = [createConfig('myforward', APP_INTEGRATION_VARIANT.FORWARDING)];
    const routes = getForwardedAppRoutes(configs);

    expect(routes).toHaveLength(1);
    expect(routes[0].key).toBe('myforward');
    expect(routes[0].props.path).toBe('myforward');
  });

  it('returns empty array when no FORWARDING type configs', () => {
    const configs = [createConfig('nativeapp', APP_INTEGRATION_VARIANT.NATIVE)];
    const routes = getForwardedAppRoutes(configs);

    expect(routes).toHaveLength(0);
  });

  it('only returns FORWARDING routes from mixed types', () => {
    const configs = [
      createConfig('framed1', APP_INTEGRATION_VARIANT.FRAME),
      createConfig('forwarded1', APP_INTEGRATION_VARIANT.FORWARDING),
      createConfig('native1', APP_INTEGRATION_VARIANT.NATIVE),
      createConfig('forwarded2', APP_INTEGRATION_VARIANT.FORWARDING),
    ];
    const routes = getForwardedAppRoutes(configs);

    expect(routes).toHaveLength(2);
    expect(routes[0].key).toBe('forwarded1');
    expect(routes[1].key).toBe('forwarded2');
  });

  it('uses path without wildcard for forwarded routes', () => {
    const configs = [createConfig('myapp', APP_INTEGRATION_VARIANT.FORWARDING)];
    const routes = getForwardedAppRoutes(configs);

    expect(routes[0].props.path).toBe('myapp');
    expect(routes[0].props.path).not.toContain('*');
  });

  it('returns empty array for empty configs', () => {
    const routes = getForwardedAppRoutes([]);
    expect(routes).toHaveLength(0);
  });
});
