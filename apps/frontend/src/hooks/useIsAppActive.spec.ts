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

import { renderHook } from '@testing-library/react';
import APPS from '@libs/appconfig/constants/apps';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useIsAppActive from './useIsAppActive';

describe('useIsAppActive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppConfigsStore.setState({ appConfigs: [] as never });
  });

  it('returns true when app is found in appConfigs', () => {
    useAppConfigsStore.setState({
      appConfigs: [{ name: APPS.MAIL }] as never,
    });

    const { result } = renderHook(() => useIsAppActive(APPS.MAIL));

    expect(result.current).toBe(true);
  });

  it('returns false when app is not in appConfigs', () => {
    useAppConfigsStore.setState({
      appConfigs: [{ name: APPS.CHAT }] as never,
    });

    const { result } = renderHook(() => useIsAppActive(APPS.MAIL));

    expect(result.current).toBe(false);
  });

  it('returns false when appConfigs is empty', () => {
    useAppConfigsStore.setState({ appConfigs: [] as never });

    const { result } = renderHook(() => useIsAppActive(APPS.CONFERENCES));

    expect(result.current).toBe(false);
  });

  it('returns true when multiple apps exist and target is among them', () => {
    useAppConfigsStore.setState({
      appConfigs: [{ name: APPS.MAIL }, { name: APPS.CHAT }, { name: APPS.SURVEYS }] as never,
    });

    const { result } = renderHook(() => useIsAppActive(APPS.SURVEYS));

    expect(result.current).toBe(true);
  });
});
