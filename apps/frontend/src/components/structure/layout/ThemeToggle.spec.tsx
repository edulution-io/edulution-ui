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

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));
vi.mock('@edulution-io/ui-kit', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button
      type="button"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));
vi.mock('@libs/common/constants/theme', () => ({
  default: { system: 'system', light: 'light', dark: 'dark' },
}));

let mockTheme = 'light';
let mockResolvedTheme = 'light';
const mockSetTheme = vi.fn();

vi.mock('@/store/useThemeStore', () => ({
  default: (selector: any) =>
    selector({
      theme: mockTheme,
      getResolvedTheme: () => mockResolvedTheme,
      setTheme: mockSetTheme,
    }),
}));

let mockIsDev = true;
vi.mock('@libs/common/constants/isDev', () => ({
  get default() {
    return mockIsDev;
  },
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockTheme = 'light';
    mockResolvedTheme = 'light';
    mockIsDev = true;
    mockSetTheme.mockClear();
  });

  it('renders null when not in dev mode', () => {
    mockIsDev = false;
    const { container } = render(<ThemeToggle />);

    expect(container.firstChild).toBeNull();
  });

  it('renders toggle button in dev mode', () => {
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: 'Toggle Theme' })).toBeInTheDocument();
  });

  it('calls setTheme with dark when current theme is light', async () => {
    const user = userEvent.setup();
    mockTheme = 'light';
    mockResolvedTheme = 'light';
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Toggle Theme' }));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with light when current theme is dark', async () => {
    const user = userEvent.setup();
    mockTheme = 'dark';
    mockResolvedTheme = 'dark';
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Toggle Theme' }));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('portals content to document.body', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: 'Toggle Theme' });
    expect(button.closest('body')).toBeTruthy();
  });
});
