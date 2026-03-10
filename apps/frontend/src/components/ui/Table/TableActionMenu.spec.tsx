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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/components/shared/DropdownMenu', () => ({
  default: ({ trigger, items }: any) => (
    <div data-testid="dropdown-menu">
      <div data-testid="dropdown-trigger">{trigger}</div>
      <ul data-testid="dropdown-items">
        {items.map((item: any) => (
          <li key={item.label}>
            <button
              type="button"
              onClick={item.onClick}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TableActionMenu from './TableActionMenu';

const createMockAction = (overrides: Record<string, any> = {}) => ({
  icon: { iconName: 'edit' },
  translationId: 'actions.edit',
  onClick: vi.fn(),
  ...overrides,
});

describe('TableActionMenu', () => {
  it('renders the dropdown menu', () => {
    const actions = [createMockAction()];
    render(<TableActionMenu actions={actions} />);

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('translates action labels using translationId', () => {
    const actions = [createMockAction({ translationId: 'actions.delete' })];
    render(<TableActionMenu actions={actions} />);

    expect(screen.getByText('actions.delete')).toBeInTheDocument();
  });

  it('calls action onClick with row when item is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const actions = [createMockAction({ onClick })];
    const mockRow = { id: '1', original: { name: 'test' } };

    render(
      <TableActionMenu
        actions={actions}
        row={mockRow as any}
      />,
    );

    await user.click(screen.getByText('actions.edit'));
    expect(onClick).toHaveBeenCalledWith(mockRow);
  });

  it('renders custom trigger when provided', () => {
    const actions = [createMockAction()];
    render(
      <TableActionMenu
        actions={actions}
        trigger={<button type="button">Custom Trigger</button>}
      />,
    );

    expect(screen.getByText('Custom Trigger')).toBeInTheDocument();
  });

  it('maps multiple actions to dropdown items', () => {
    const actions = [
      createMockAction({ translationId: 'actions.edit' }),
      createMockAction({ translationId: 'actions.delete' }),
    ];
    render(<TableActionMenu actions={actions} />);

    expect(screen.getByText('actions.edit')).toBeInTheDocument();
    expect(screen.getByText('actions.delete')).toBeInTheDocument();
  });
});
