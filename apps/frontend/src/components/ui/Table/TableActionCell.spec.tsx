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
vi.mock('./TableActionMenu', () => ({
  default: ({ actions, row, trigger }: any) => <div data-testid="table-action-menu">{trigger}</div>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import TableActionCell from './TableActionCell';

const createMockRow = () => ({
  id: 'row-1',
  original: { id: '1', name: 'Test' },
  getIsSelected: vi.fn(() => false),
});

describe('TableActionCell', () => {
  it('returns null when actions array is empty', () => {
    const row = createMockRow();
    const { container } = render(
      <TableActionCell
        actions={[]}
        row={row as any}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders a single action button when there is exactly one action', () => {
    const row = createMockRow();
    const onClick = vi.fn();
    const actions = [{ icon: faTrash, onClick, translationId: 'delete' }];

    render(
      <TableActionCell
        actions={actions}
        row={row as any}
      />,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick with row when single action button is clicked', async () => {
    const user = userEvent.setup();
    const row = createMockRow();
    const onClick = vi.fn();
    const actions = [{ icon: faTrash, onClick, translationId: 'delete' }];

    render(
      <TableActionCell
        actions={actions}
        row={row as any}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(row);
  });

  it('renders TableActionMenu when there are multiple actions', () => {
    const row = createMockRow();
    const actions = [
      { icon: faTrash, onClick: vi.fn(), translationId: 'delete' },
      { icon: faPen, onClick: vi.fn(), translationId: 'edit' },
    ];

    render(
      <TableActionCell
        actions={actions}
        row={row as any}
      />,
    );

    expect(screen.getByTestId('table-action-menu')).toBeInTheDocument();
  });

  it('stops event propagation when single action button is clicked', async () => {
    const user = userEvent.setup();
    const row = createMockRow();
    const parentClick = vi.fn();
    const actions = [{ icon: faTrash, onClick: vi.fn(), translationId: 'delete' }];

    render(
      <div
        onClick={parentClick}
        onKeyDown={parentClick}
        role="presentation"
      >
        <TableActionCell
          actions={actions}
          row={row as any}
        />
      </div>,
    );

    await user.click(screen.getByRole('button'));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
