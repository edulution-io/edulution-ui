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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) =>
    args
      .flatMap((a: any) => {
        if (typeof a === 'string') return a;
        if (a && typeof a === 'object')
          return Object.entries(a)
            .filter(([, v]) => v)
            .map(([k]) => k);
        return [];
      })
      .filter(Boolean)
      .join(' '),
}));
vi.mock('@libs/ui/constants', () => ({
  SIDEBAR_ICON_WIDTH: '40px',
}));
vi.mock('@/assets/icons', () => ({
  MobileLogoIcon: (props: any) => (
    <span
      data-testid="mobile-logo-icon"
      {...props}
    />
  ),
}));

const mockToggleLauncher = vi.fn();
vi.mock('@/components/ui/Launcher/useLauncherStore', () => ({
  default: vi.fn(() => ({
    toggleLauncher: mockToggleLauncher,
  })),
}));
vi.mock('@/store/EduApiStore/usePlatformStore', () => ({
  default: (selector: any) => selector({ isEdulutionApp: false }),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LauncherButton from './LauncherButton';

describe('LauncherButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the launcher title', () => {
    render(<LauncherButton />);
    expect(screen.getByText('launcher.title')).toBeInTheDocument();
  });

  it('renders the mobile logo icon', () => {
    render(<LauncherButton />);
    expect(screen.getByTestId('mobile-logo-icon')).toBeInTheDocument();
  });

  it('calls toggleLauncher when clicked', () => {
    render(<LauncherButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockToggleLauncher).toHaveBeenCalledTimes(1);
  });

  it('renders as a button element', () => {
    render(<LauncherButton />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });
});
