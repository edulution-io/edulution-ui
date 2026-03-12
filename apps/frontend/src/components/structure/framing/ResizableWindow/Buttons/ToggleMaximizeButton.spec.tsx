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

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span
      data-testid="fa-icon"
      data-icon={icon?.iconName}
    />
  ),
}));

vi.mock('./WindowControlBaseButton', () => ({
  default: ({ onClick, tooltipTranslationId, className, children }: any) => (
    <button
      data-testid="window-control-btn"
      data-tooltip={tooltipTranslationId}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToggleMaximizeButton from './ToggleMaximizeButton';

describe('ToggleMaximizeButton', () => {
  const defaultProps = {
    handleMaximizeToggle: vi.fn(),
    isMinimized: false,
    isMaximized: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button', () => {
    render(<ToggleMaximizeButton {...defaultProps} />);
    expect(screen.getByTestId('window-control-btn')).toBeInTheDocument();
  });

  it('shows maximize tooltip when not maximized', () => {
    render(
      <ToggleMaximizeButton
        {...defaultProps}
        isMaximized={false}
      />,
    );
    expect(screen.getByTestId('window-control-btn')).toHaveAttribute('data-tooltip', 'common.maximize');
  });

  it('shows restore tooltip when maximized', () => {
    render(
      <ToggleMaximizeButton
        {...defaultProps}
        isMaximized
      />,
    );
    expect(screen.getByTestId('window-control-btn')).toHaveAttribute('data-tooltip', 'common.restore');
  });

  it('calls handleMaximizeToggle when clicked', async () => {
    const user = userEvent.setup();
    const handleMaximizeToggle = vi.fn();
    render(
      <ToggleMaximizeButton
        {...defaultProps}
        handleMaximizeToggle={handleMaximizeToggle}
      />,
    );

    await user.click(screen.getByTestId('window-control-btn'));
    expect(handleMaximizeToggle).toHaveBeenCalledOnce();
  });

  it('applies minimized classes when isMinimized is true', () => {
    render(
      <ToggleMaximizeButton
        {...defaultProps}
        isMinimized
      />,
    );
    const btn = screen.getByTestId('window-control-btn');
    expect(btn.className).toContain('h-5');
    expect(btn.className).toContain('w-8');
  });

  it('renders the icon', () => {
    render(<ToggleMaximizeButton {...defaultProps} />);
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });
});
