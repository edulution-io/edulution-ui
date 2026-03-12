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
      .flatMap((arg: any) => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object' && arg !== null) {
          return Object.entries(arg)
            .filter(([, v]) => v)
            .map(([k]) => k);
        }
        return [];
      })
      .filter(Boolean)
      .join(' '),
  Button: ({ children, variant, className, onClick, ...props }: any) => (
    <button
      data-testid="hour-button"
      data-variant={variant}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HourButton from './HourButton';

describe('HourButton', () => {
  it('renders the hour number', () => {
    render(
      <HourButton
        hour={14}
        currentHour={10}
        onChangeHour={vi.fn()}
        variant="default"
      />,
    );
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('uses btn-outline variant when hour matches currentHour', () => {
    render(
      <HourButton
        hour={5}
        currentHour={5}
        onChangeHour={vi.fn()}
        variant="default"
      />,
    );
    expect(screen.getByTestId('hour-button')).toHaveAttribute('data-variant', 'btn-outline');
  });

  it('uses btn-small variant when hour does not match currentHour', () => {
    render(
      <HourButton
        hour={5}
        currentHour={10}
        onChangeHour={vi.fn()}
        variant="default"
      />,
    );
    expect(screen.getByTestId('hour-button')).toHaveAttribute('data-variant', 'btn-small');
  });

  it('calls onChangeHour with the hour when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <HourButton
        hour={8}
        currentHour={0}
        onChangeHour={handleChange}
        variant="default"
      />,
    );
    await user.click(screen.getByTestId('hour-button'));
    expect(handleChange).toHaveBeenCalledWith(8);
  });
});
