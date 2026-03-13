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
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  inputVariants: () => 'input-base',
  Input: React.forwardRef<HTMLInputElement, any>(({ variant, shouldTrim, icon, ...props }, ref) => (
    <input
      ref={ref}
      data-testid="inner-input"
      {...props}
    />
  )),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputWithActionIcons from './InputWithActionIcons';

const mockIcon = { iconName: 'search', prefix: 'fas', icon: [512, 512, [], '', ''] } as any;
const mockIcon2 = { iconName: 'times', prefix: 'fas', icon: [512, 512, [], '', ''] } as any;

describe('InputWithActionIcons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an input element', () => {
    render(<InputWithActionIcons placeholder="Type here" />);

    expect(screen.getByTestId('inner-input')).toBeInTheDocument();
  });

  it('renders action icons', () => {
    const actionIcons = [
      { icon: mockIcon, onClick: vi.fn() },
      { icon: mockIcon2, onClick: vi.fn() },
    ];

    render(<InputWithActionIcons actionIcons={actionIcons} />);

    expect(screen.getByTestId('fa-icon-search')).toBeInTheDocument();
    expect(screen.getByTestId('fa-icon-times')).toBeInTheDocument();
  });

  it('calls onClick when an action icon is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const actionIcons = [{ icon: mockIcon, onClick: handleClick }];

    render(<InputWithActionIcons actionIcons={actionIcons} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables icon buttons when disabled is true', () => {
    const actionIcons = [{ icon: mockIcon, onClick: vi.fn() }];

    render(
      <InputWithActionIcons
        actionIcons={actionIcons}
        disabled
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not render icon container when no action icons', () => {
    const { container } = render(<InputWithActionIcons />);

    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
