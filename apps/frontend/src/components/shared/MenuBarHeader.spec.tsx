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

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@libs/menubar/menuBarIcon', () => ({}));

vi.mock('./MenuBarRenderIcon', () => ({
  default: ({ alt, className }: any) => (
    <span
      data-testid="menu-bar-render-icon"
      data-alt={alt}
      className={className}
    />
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuBarHeader from './MenuBarHeader';

describe('MenuBarHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the icon and title', () => {
    render(
      <MenuBarHeader
        icon="/icon.svg"
        title="My App"
        pathParts={['/app']}
      />,
    );

    expect(screen.getByTestId('menu-bar-render-icon')).toBeInTheDocument();
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('navigates to pathParts[0] on click when no onHeaderClick', async () => {
    const user = userEvent.setup();

    render(
      <MenuBarHeader
        icon="/icon.svg"
        title="My App"
        pathParts={['/dashboard']}
      />,
    );

    await user.click(screen.getByRole('button'));

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('calls onHeaderClick instead of navigating when provided', async () => {
    const user = userEvent.setup();
    const handleHeaderClick = vi.fn();

    render(
      <MenuBarHeader
        icon="/icon.svg"
        title="My App"
        pathParts={['/dashboard']}
        onHeaderClick={handleHeaderClick}
      />,
    );

    await user.click(screen.getByRole('button'));

    expect(handleHeaderClick).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
