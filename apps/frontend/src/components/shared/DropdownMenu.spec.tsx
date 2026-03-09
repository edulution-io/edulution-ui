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

vi.mock('@/components/ui/DropdownMenuSH', () => ({
  DropdownMenuSH: ({ children, open, onOpenChange }: any) => <div data-testid="dropdown-root">{children}</div>,
  DropdownMenuTrigger: ({ children, disabled, asChild }: any) => (
    <div
      data-testid="dropdown-trigger"
      data-disabled={disabled}
    >
      {children}
    </div>
  ),
  DropdownMenuPortal: ({ children }: any) => <div data-testid="dropdown-portal">{children}</div>,
  DropdownMenuContent: ({ children, className }: any) => (
    <div
      data-testid="dropdown-content"
      className={className}
    >
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onSelect, className }: any) => (
    <div
      data-testid="dropdown-item"
      role="menuitem"
      onClick={onSelect}
      className={className}
    >
      {children}
    </div>
  ),
  DropdownMenuSeparator: ({ className }: any) => (
    <hr
      data-testid="dropdown-separator"
      className={className}
    />
  ),
  DropdownMenuCheckboxItem: ({ children, checked, onCheckedChange }: any) => (
    <div
      data-testid="dropdown-checkbox-item"
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
    >
      {children}
    </div>
  ),
}));

vi.mock('@libs/ui/types/dropdownMenuItemType', () => ({}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DropdownMenu from './DropdownMenu';

describe('DropdownMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when items is empty', () => {
    const { container } = render(
      <DropdownMenu
        trigger={<button>Open</button>}
        items={[]}
      />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('renders trigger and menu items', () => {
    const items = [
      { label: 'Edit', onClick: vi.fn() },
      { label: 'Delete', onClick: vi.fn() },
    ];

    render(
      <DropdownMenu
        trigger={<button>Open</button>}
        items={items}
      />,
    );

    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders separator items', () => {
    const items = [
      { label: 'First', onClick: vi.fn() },
      { label: 'sep-1', isSeparator: true },
      { label: 'Second', onClick: vi.fn() },
    ];

    render(
      <DropdownMenu
        trigger={<button>Open</button>}
        items={items}
      />,
    );

    expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument();
  });

  it('renders checkbox items', () => {
    const items = [{ label: 'Toggle me', isCheckbox: true, checked: true, onCheckedChange: vi.fn() }];

    render(
      <DropdownMenu
        trigger={<button>Open</button>}
        items={items}
      />,
    );

    const checkbox = screen.getByRole('menuitemcheckbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Toggle me')).toBeInTheDocument();
  });

  it('calls onClick when a regular item is selected', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const items = [{ label: 'Action', onClick: handleClick }];

    render(
      <DropdownMenu
        trigger={<button>Open</button>}
        items={items}
      />,
    );

    await user.click(screen.getByRole('menuitem'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
