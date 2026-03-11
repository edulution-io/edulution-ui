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

vi.mock('@radix-ui/react-switch', () => {
  const Root = ({ children, className, onCheckedChange, disabled, ...props }: any) => (
    <button
      data-testid="switch-root"
      className={className}
      role="switch"
      disabled={disabled}
      onClick={() => onCheckedChange?.(!props.checked)}
      {...props}
    >
      {children}
    </button>
  );
  Root.displayName = 'Switch';
  const Thumb = ({ className }: any) => (
    <span
      data-testid="switch-thumb"
      className={className}
    />
  );
  return { Root, Thumb };
});

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Switch from './Switch';

describe('Switch', () => {
  it('renders the switch with root and thumb', () => {
    render(<Switch />);
    expect(screen.getByTestId('switch-root')).toBeInTheDocument();
    expect(screen.getByTestId('switch-thumb')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Switch className="custom-class" />);
    expect(screen.getByTestId('switch-root').className).toContain('custom-class');
  });

  it('forwards disabled prop', () => {
    render(<Switch disabled />);
    expect(screen.getByTestId('switch-root')).toBeDisabled();
  });

  it('calls onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);

    await user.click(screen.getByTestId('switch-root'));
    expect(handleChange).toHaveBeenCalled();
  });
});
