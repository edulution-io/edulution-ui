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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-use-before-define, jsx-a11y/label-has-associated-control, jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus, jsx-a11y/role-has-required-aria-props, react/button-has-type, react/display-name, react/no-array-index-key, no-underscore-dangle, no-plusplus */

let mockIsLmn = false;
let mockIsSchoolEnvironment = true;
let mockLmnVersions: Record<string, string> = {};
let mockIsGetVersionLoading = false;
let mockIsLmnVersionSupported = true;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

vi.mock('@libs/lmnApi/utils/isLmnVersionSupported', () => ({
  default: (version: string) => mockIsLmnVersionSupported,
}));

vi.mock('@/hooks/useDeploymentTarget', () => ({
  default: () => ({ isLmn: mockIsLmn }),
}));

vi.mock('@/hooks/useOrganizationType', () => ({
  default: () => ({ isSchoolEnvironment: mockIsSchoolEnvironment }),
}));

vi.mock('@/store/useLmnApiStore', () => ({
  default: (selector: any) => {
    const state = {
      lmnVersions: mockLmnVersions,
      isGetVersionLoading: mockIsGetVersionLoading,
    };
    return selector(state);
  },
}));

vi.mock('@/components/structure/layout/PageLayout', () => ({
  default: ({ children }: any) => <div data-testid="page-layout">{children}</div>,
}));

vi.mock('./LmnVersionWarning', () => ({
  default: () => <div data-testid="lmn-version-warning">Version Warning</div>,
}));

vi.mock('@/assets/icons', () => ({
  LinuxmusterIcon: 'linuxmuster-icon.svg',
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import LmnVersionGuard from './LmnVersionGuard';

describe('LmnVersionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLmn = false;
    mockIsSchoolEnvironment = true;
    mockLmnVersions = {};
    mockIsGetVersionLoading = false;
    mockIsLmnVersionSupported = true;
  });

  it('returns null when LMN and loading', () => {
    mockIsLmn = true;
    mockIsGetVersionLoading = true;

    const { container } = render(<LmnVersionGuard />);

    expect(container.innerHTML).toBe('');
  });

  it('shows warning when version not supported', () => {
    mockIsLmn = true;
    mockIsGetVersionLoading = false;
    mockLmnVersions = { 'linuxmuster-api7': '7.2.0' };
    mockIsLmnVersionSupported = false;

    render(<LmnVersionGuard />);

    expect(screen.getByTestId('lmn-version-warning')).toBeInTheDocument();
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('renders Outlet when version is supported', () => {
    mockIsLmn = true;
    mockIsGetVersionLoading = false;
    mockLmnVersions = { 'linuxmuster-api7': '7.3.28' };
    mockIsLmnVersionSupported = true;

    render(<LmnVersionGuard />);

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('lmn-version-warning')).not.toBeInTheDocument();
  });

  it('renders Outlet when not LMN deployment', () => {
    mockIsLmn = false;
    mockIsGetVersionLoading = false;
    mockLmnVersions = {};
    mockIsLmnVersionSupported = false;

    render(<LmnVersionGuard />);

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('lmn-version-warning')).not.toBeInTheDocument();
  });
});
