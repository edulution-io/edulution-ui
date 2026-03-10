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
  FontAwesomeIcon: ({ icon, className }: any) => (
    <span
      data-testid={`fa-icon-${icon?.iconName || 'unknown'}`}
      className={className}
    />
  ),
}));

vi.mock('@edulution-io/ui-kit', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button
      data-testid="collapse-button"
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faArrowRightFromBracket: { iconName: 'arrow-right-from-bracket', prefix: 'fas' },
  faArrowRightToBracket: { iconName: 'arrow-right-to-bracket', prefix: 'fas' },
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuBarCollapseButton from './MenuBarCollapseButton';

describe('MenuBarCollapseButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button', () => {
    render(
      <MenuBarCollapseButton
        isCollapsed={false}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByTestId('collapse-button')).toBeInTheDocument();
  });

  it('shows arrow-right-to-bracket icon when collapsed', () => {
    render(
      <MenuBarCollapseButton
        isCollapsed
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByTestId('fa-icon-arrow-right-to-bracket')).toBeInTheDocument();
  });

  it('shows arrow-right-from-bracket icon when expanded', () => {
    render(
      <MenuBarCollapseButton
        isCollapsed={false}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByTestId('fa-icon-arrow-right-from-bracket')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(
      <MenuBarCollapseButton
        isCollapsed={false}
        onToggle={handleToggle}
      />,
    );

    await user.click(screen.getByTestId('collapse-button'));

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('applies e-resize cursor class when collapsed', () => {
    render(
      <MenuBarCollapseButton
        isCollapsed
        onToggle={vi.fn()}
      />,
    );

    const button = screen.getByTestId('collapse-button');
    expect(button.className).toContain('cursor-e-resize');
  });
});
