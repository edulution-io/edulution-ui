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
vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));
vi.mock('@/components/ui/Table/SelectableCell', () => ({
  default: ({ children }: any) => <div data-testid="selectable-cell">{children}</div>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SortTableCell from './SortTableCell';

describe('SortTableCell', () => {
  const defaultProps = {
    moveUp: vi.fn().mockResolvedValue(undefined),
    moveDown: vi.fn().mockResolvedValue(undefined),
    position: 3,
    lastPosition: 5,
  };

  it('renders the position number', () => {
    render(<SortTableCell {...defaultProps} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders inside a SelectableCell', () => {
    render(<SortTableCell {...defaultProps} />);

    expect(screen.getByTestId('selectable-cell')).toBeInTheDocument();
  });

  it('disables up button when position is 1', () => {
    render(
      <SortTableCell
        {...defaultProps}
        position={1}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
  });

  it('disables down button when position equals lastPosition', () => {
    render(
      <SortTableCell
        {...defaultProps}
        position={5}
        lastPosition={5}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it('calls moveUp when up button is clicked', async () => {
    const user = userEvent.setup();
    const moveUp = vi.fn().mockResolvedValue(undefined);
    render(
      <SortTableCell
        {...defaultProps}
        moveUp={moveUp}
      />,
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    expect(moveUp).toHaveBeenCalledTimes(1);
  });

  it('calls moveDown when down button is clicked', async () => {
    const user = userEvent.setup();
    const moveDown = vi.fn().mockResolvedValue(undefined);
    render(
      <SortTableCell
        {...defaultProps}
        moveDown={moveDown}
      />,
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);
    expect(moveDown).toHaveBeenCalledTimes(1);
  });
});
