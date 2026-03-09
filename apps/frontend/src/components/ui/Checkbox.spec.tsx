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

vi.mock('@radix-ui/react-checkbox', () => {
  const Root = ({ children, className, onClick, disabled, id, ...props }: any) => (
    <button
      data-testid="checkbox-root"
      className={className}
      onClick={onClick}
      disabled={disabled}
      id={id}
      role="checkbox"
      {...props}
    >
      {children}
    </button>
  );
  Root.displayName = 'Checkbox';
  const Indicator = ({ children }: any) => <span data-testid="checkbox-indicator">{children}</span>;
  return { Root, Indicator };
});

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }: any) => (
    <span
      data-testid="fa-icon"
      className={className}
    />
  ),
}));

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
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('renders without label', () => {
    render(<Checkbox />);
    expect(screen.getByTestId('checkbox-root')).toBeInTheDocument();
  });

  it('renders with label text', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('calls onCheckboxClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Checkbox onCheckboxClick={handleClick} />);

    await user.click(screen.getByTestId('checkbox-root'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders as disabled', () => {
    render(
      <Checkbox
        label="Disabled"
        disabled
      />,
    );
    expect(screen.getByTestId('checkbox-root')).toBeDisabled();
  });

  it('applies disabled styling to label', () => {
    render(
      <Checkbox
        label="Disabled"
        disabled
      />,
    );
    const labelSpan = screen.getByText('Disabled');
    expect(labelSpan.className).toContain('cursor-disabled');
  });
});
