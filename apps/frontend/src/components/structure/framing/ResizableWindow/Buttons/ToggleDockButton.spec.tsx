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

vi.mock('./WindowControlBaseButton', () => ({
  default: ({ onClick, tooltipTranslationId, children }: any) => (
    <button
      data-testid="window-control-btn"
      data-tooltip={tooltipTranslationId}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToggleDockButton from './ToggleDockButton';

describe('ToggleDockButton', () => {
  it('renders the button', () => {
    render(
      <ToggleDockButton
        onClick={vi.fn()}
        isDocked={false}
      />,
    );
    expect(screen.getByTestId('window-control-btn')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(
      <ToggleDockButton
        onClick={vi.fn()}
        isDocked={false}
      />,
    );
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  it('shows dock tooltip when not docked', () => {
    render(
      <ToggleDockButton
        onClick={vi.fn()}
        isDocked={false}
      />,
    );
    expect(screen.getByTestId('window-control-btn')).toHaveAttribute('data-tooltip', 'common.dock');
  });

  it('shows undock tooltip when docked', () => {
    render(
      <ToggleDockButton
        onClick={vi.fn()}
        isDocked
      />,
    );
    expect(screen.getByTestId('window-control-btn')).toHaveAttribute('data-tooltip', 'common.undock');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <ToggleDockButton
        onClick={handleClick}
        isDocked={false}
      />,
    );

    await user.click(screen.getByTestId('window-control-btn'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
