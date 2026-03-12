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
import ORGANIZATION_TYPE from '@libs/common/constants/organization-type';
import useOrganizationType from './useOrganizationType';

describe('useOrganizationType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGlobalSettingsApiStore.setState({ globalSettings: null });
  });

  it('returns isSchool true and isSchoolEnvironment true for school', () => {
    useGlobalSettingsApiStore.setState({
      globalSettings: { general: { organizationType: ORGANIZATION_TYPE.SCHOOL } } as never,
    });

    const { result } = renderHook(() => useOrganizationType());

    expect(result.current.isSchool).toBe(true);
    expect(result.current.isBusiness).toBe(false);
    expect(result.current.isPublicAdministration).toBe(false);
    expect(result.current.isSchoolEnvironment).toBe(true);
  });

  it('returns isBusiness true and isSchoolEnvironment false for business', () => {
    useGlobalSettingsApiStore.setState({
      globalSettings: { general: { organizationType: ORGANIZATION_TYPE.BUSINESS } } as never,
    });

    const { result } = renderHook(() => useOrganizationType());

    expect(result.current.isSchool).toBe(false);
    expect(result.current.isBusiness).toBe(true);
    expect(result.current.isPublicAdministration).toBe(false);
    expect(result.current.isSchoolEnvironment).toBe(false);
  });

  it('returns isPublicAdministration true and isSchoolEnvironment true for public administration', () => {
    useGlobalSettingsApiStore.setState({
      globalSettings: { general: { organizationType: ORGANIZATION_TYPE.PUBLIC_ADMINISTRATION } } as never,
    });

    const { result } = renderHook(() => useOrganizationType());

    expect(result.current.isSchool).toBe(false);
    expect(result.current.isBusiness).toBe(false);
    expect(result.current.isPublicAdministration).toBe(true);
    expect(result.current.isSchoolEnvironment).toBe(true);
  });

  it('returns all false when globalSettings is null', () => {
    useGlobalSettingsApiStore.setState({ globalSettings: null });

    const { result } = renderHook(() => useOrganizationType());

    expect(result.current.isSchool).toBe(false);
    expect(result.current.isBusiness).toBe(false);
    expect(result.current.isPublicAdministration).toBe(false);
    expect(result.current.isSchoolEnvironment).toBe(false);
  });
});
