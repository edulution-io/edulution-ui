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
  FontAwesomeIcon: ({ 'data-testid': testId, ...props }: any) => (
    <span
      data-testid={testId || 'fa-icon'}
      {...props}
    />
  ),
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@libs/ui/constants/commonClassNames', () => ({
  inputVariants: () => 'input-base',
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';

describe('Input', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders text input with placeholder', () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('handles onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');

    expect(handleChange).toHaveBeenCalled();
  });

  it('trims value when shouldTrim is true', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Input
        shouldTrim
        onChange={handleChange}
      />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, ' a ');

    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
    expect(lastCall.target.value).not.toMatch(/^\s/);
  });

  it('password input toggles visibility', async () => {
    const user = userEvent.setup();

    render(
      <Input
        type="password"
        placeholder="Password"
      />,
    );

    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);

    expect(input).toHaveAttribute('type', 'text');

    await user.click(toggleButton);

    expect(input).toHaveAttribute('type', 'password');
  });

  it('number input converts value to number', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Input
        type="number"
        onChange={handleChange}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.type(input, '42');

    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
    expect(typeof lastCall.target.value).toBe('number');
  });

  it('renders icon when provided', () => {
    render(
      <Input
        icon={<span data-testid="custom-icon">icon</span>}
        placeholder="With icon"
      />,
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
