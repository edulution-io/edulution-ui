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

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HexagonButton from './HexagonButton';

describe('HexagonButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children content', () => {
    render(
      <HexagonButton onClick={vi.fn()}>
        <span data-testid="child">Click me</span>
      </HexagonButton>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<HexagonButton onClick={handleClick}>Action</HexagonButton>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as type="button"', () => {
    render(<HexagonButton onClick={vi.fn()}>Test</HexagonButton>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies hexagon clip-path style', () => {
    render(<HexagonButton onClick={vi.fn()}>Hex</HexagonButton>);

    const button = screen.getByRole('button');
    expect(button.style.clipPath).toContain('polygon');
  });

  it('forwards ref to the button element', () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <HexagonButton
        ref={ref}
        onClick={vi.fn()}
      >
        Ref Test
      </HexagonButton>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
