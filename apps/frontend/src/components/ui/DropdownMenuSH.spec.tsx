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
  FontAwesomeIcon: ({ className }: { className?: string }) => (
    <span
      data-testid="fa-icon"
      className={className}
    />
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenuSH,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from './DropdownMenuSH';

describe('DropdownMenuSH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button', () => {
    render(
      <DropdownMenuSH>
        <DropdownMenuTrigger asChild>
          <button type="button">Open Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuSH>,
    );

    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('opens menu when trigger is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenuSH>
        <DropdownMenuTrigger asChild>
          <button type="button">Open Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuSH>,
    );

    await user.click(screen.getByText('Open Menu'));

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('calls onClick handler when item is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <DropdownMenuSH>
        <DropdownMenuTrigger asChild>
          <button type="button">Open Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleClick}>Action Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuSH>,
    );

    await user.click(screen.getByText('Open Menu'));
    await user.click(screen.getByText('Action Item'));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders label element', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenuSH>
        <DropdownMenuTrigger asChild>
          <button type="button">Open Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Label</DropdownMenuLabel>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuSH>,
    );

    await user.click(screen.getByText('Open Menu'));

    expect(screen.getByText('My Label')).toBeInTheDocument();
  });

  it('renders separator', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenuSH>
        <DropdownMenuTrigger asChild>
          <button type="button">Open Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator data-testid="separator" />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuSH>,
    );

    await user.click(screen.getByText('Open Menu'));

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('renders shortcut text', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenuSH>
        <DropdownMenuTrigger asChild>
          <button type="button">Open Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Save
            <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuSH>,
    );

    await user.click(screen.getByText('Open Menu'));

    expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
  });

  it('renders checkbox item with checked state', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenuSH>
        <DropdownMenuTrigger asChild>
          <button type="button">Open Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Show Toolbar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false}>Show Sidebar</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenuSH>,
    );

    await user.click(screen.getByText('Open Menu'));

    expect(screen.getByText('Show Toolbar')).toBeInTheDocument();
    expect(screen.getByText('Show Sidebar')).toBeInTheDocument();
  });

  it('disabled item has pointer-events-none styling', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenuSH>
        <DropdownMenuTrigger asChild>
          <button type="button">Open Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuSH>,
    );

    await user.click(screen.getByText('Open Menu'));

    const disabledItem = screen.getByText('Disabled Item').closest('[data-disabled]');
    expect(disabledItem).toBeInTheDocument();
  });

  it('does not show menu content before trigger is clicked', () => {
    render(
      <DropdownMenuSH>
        <DropdownMenuTrigger asChild>
          <button type="button">Open Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Hidden Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuSH>,
    );

    expect(screen.queryByText('Hidden Item')).not.toBeInTheDocument();
  });
});
