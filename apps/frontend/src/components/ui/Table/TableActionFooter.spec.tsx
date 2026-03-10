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
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
}));
vi.mock('./TableActionMenu', () => ({
  default: ({ actions, trigger }: any) => <div data-testid="table-action-menu">{trigger}</div>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import TableActionFooter from './TableActionFooter';

const createTableWrapper = ({ children }: { children: React.ReactNode }) => <table>{children}</table>;

describe('TableActionFooter', () => {
  it('returns null when actions array is empty', () => {
    const { container } = render(
      <TableActionFooter
        actions={[]}
        columnLength={3}
      />,
      { wrapper: createTableWrapper },
    );

    expect(container.querySelector('tfoot')).not.toBeInTheDocument();
  });

  it('renders action buttons when actions count is less than 3', () => {
    const onClick = vi.fn();
    const actions = [{ icon: faTrash, onClick, translationId: 'delete', disabled: false }];

    render(
      <TableActionFooter
        actions={actions}
        columnLength={3}
      />,
      { wrapper: createTableWrapper },
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls action onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const actions = [{ icon: faTrash, onClick, translationId: 'delete', disabled: false }];

    render(
      <TableActionFooter
        actions={actions}
        columnLength={3}
      />,
      { wrapper: createTableWrapper },
    );

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders TableActionMenu when actions count is 3 or more', () => {
    const actions = [
      { icon: faTrash, onClick: vi.fn(), translationId: 'delete' },
      { icon: faPen, onClick: vi.fn(), translationId: 'edit' },
      { icon: faTrash, onClick: vi.fn(), translationId: 'archive' },
    ];

    render(
      <TableActionFooter
        actions={actions}
        columnLength={3}
      />,
      { wrapper: createTableWrapper },
    );

    expect(screen.getByTestId('table-action-menu')).toBeInTheDocument();
  });

  it('renders disabled button when action is disabled', () => {
    const actions = [{ icon: faTrash, onClick: vi.fn(), translationId: 'delete', disabled: true }];

    render(
      <TableActionFooter
        actions={actions}
        columnLength={3}
      />,
      { wrapper: createTableWrapper },
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
