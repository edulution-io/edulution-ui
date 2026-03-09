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
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));
vi.mock('@/components/ui/Checkbox', () => ({
  default: React.forwardRef((props: any, ref: any) => (
    <input
      ref={ref}
      data-testid="checkbox"
      type="checkbox"
      checked={props.checked || false}
      disabled={props.disabled}
      onChange={() => props.onCheckedChange?.(!props.checked)}
      onClick={props.onClick}
      aria-label={props['aria-label']}
    />
  )),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectableCell from './SelectableCell';

const createMockRow = (overrides: Record<string, any> = {}) => ({
  getIsSelected: vi.fn(() => false),
  getCanSelect: vi.fn(() => true),
  toggleSelected: vi.fn(),
  ...overrides,
});

describe('SelectableCell', () => {
  it('renders checkbox when row prop is provided', () => {
    const row = createMockRow();
    render(
      <SelectableCell
        row={row as any}
        text="Test"
      />,
    );

    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  it('renders text content', () => {
    render(<SelectableCell text="Hello World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders children when text is not provided', () => {
    render(
      <SelectableCell>
        <span>Child Content</span>
      </SelectableCell>,
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('calls onClick when cell is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SelectableCell
        onClick={onClick}
        text="Clickable"
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('disables checkbox when row cannot be selected', () => {
    const row = createMockRow({ getCanSelect: vi.fn(() => false) });
    render(
      <SelectableCell
        row={row as any}
        text="Test"
      />,
    );

    expect(screen.getByTestId('checkbox')).toBeDisabled();
  });

  it('renders icon when provided', () => {
    const icon = <span data-testid="custom-icon">Icon</span>;
    render(
      <SelectableCell
        text="With Icon"
        icon={icon}
      />,
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('applies cursor-pointer class when onClick is provided', () => {
    const onClick = vi.fn();
    render(
      <SelectableCell
        onClick={onClick}
        text="Clickable"
      />,
    );

    const button = screen.getByRole('button');
    expect(button.className).toContain('cursor-pointer');
  });
});
