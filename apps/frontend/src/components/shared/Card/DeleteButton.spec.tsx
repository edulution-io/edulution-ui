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
  Button: ({ children, onClick, className, ...props }: any) => (
    <button
      data-testid="delete-button"
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@libs/common/constants/standardActionIcons', () => ({
  DeleteIcon: { iconName: 'trash', prefix: 'fas' },
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteButton from './DeleteButton';

describe('DeleteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a button with a FontAwesome icon', () => {
    render(<DeleteButton onDelete={vi.fn()} />);

    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  it('calls onDelete when clicked', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();

    render(<DeleteButton onDelete={handleDelete} />);

    await user.click(screen.getByTestId('delete-button'));

    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('applies positioning and color classes', () => {
    render(<DeleteButton onDelete={vi.fn()} />);

    const button = screen.getByTestId('delete-button');
    expect(button.className).toContain('absolute');
    expect(button.className).toContain('bg-ciRed');
  });
});
