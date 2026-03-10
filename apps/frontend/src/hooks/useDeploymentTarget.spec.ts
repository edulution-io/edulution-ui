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
import useGlobalSettingsApiStore from '@/pages/Settings/GlobalSettings/useGlobalSettingsApiStore';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import useDeploymentTarget from './useDeploymentTarget';

describe('useDeploymentTarget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGlobalSettingsApiStore.setState({ globalSettings: null });
  });

  it('returns isLmn true and isGeneric false for linuxmuster deployment', () => {
    useGlobalSettingsApiStore.setState({
      globalSettings: { general: { deploymentTarget: DEPLOYMENT_TARGET.LINUXMUSTER } } as never,
    });

    const { result } = renderHook(() => useDeploymentTarget());

    expect(result.current.isLmn).toBe(true);
    expect(result.current.isGeneric).toBe(false);
  });

  it('returns isLmn false and isGeneric true for generic deployment', () => {
    useGlobalSettingsApiStore.setState({
      globalSettings: { general: { deploymentTarget: DEPLOYMENT_TARGET.GENERIC } } as never,
    });

    const { result } = renderHook(() => useDeploymentTarget());

    expect(result.current.isLmn).toBe(false);
    expect(result.current.isGeneric).toBe(true);
  });

  it('returns both false when globalSettings is null', () => {
    useGlobalSettingsApiStore.setState({ globalSettings: null });

    const { result } = renderHook(() => useDeploymentTarget());

    expect(result.current.isLmn).toBe(false);
    expect(result.current.isGeneric).toBe(false);
  });
});
