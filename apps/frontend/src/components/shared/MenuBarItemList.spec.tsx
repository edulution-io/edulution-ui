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

vi.mock('./MenuBarItem', () => ({
  default: ({ item, isActive, isExpanded, shouldCollapse, onToggleExpand, onCloseMobileMenu }: any) => (
    <div
      data-testid={`menu-bar-item-${item.id}`}
      data-active={isActive}
      data-expanded={isExpanded}
      data-collapsed={shouldCollapse}
    >
      <button
        data-testid={`toggle-${item.id}`}
        onClick={() => onToggleExpand(item.id)}
      >
        {item.label}
      </button>
      <button
        data-testid={`close-mobile-${item.id}`}
        onClick={onCloseMobileMenu}
      >
        close
      </button>
    </div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuBarItemList from './MenuBarItemList';

const createMenuItem = (id: string, label: string) => ({
  id,
  label,
  icon: '/icon.svg',
  action: vi.fn(),
});

const defaultProps = {
  isSelected: '',
  expandedItems: new Set<string>(),
  shouldCollapse: false,
  activeColorClass: 'bg-blue-500',
  activeSection: null,
  pathParts: ['/app'],
  onToggleExpand: vi.fn(),
  onCloseMobileMenu: vi.fn(),
};

describe('MenuBarItemList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all menu items', () => {
    const menuItems = [createMenuItem('item-1', 'First'), createMenuItem('item-2', 'Second')];

    render(
      <MenuBarItemList
        {...defaultProps}
        menuItems={menuItems}
      />,
    );

    expect(screen.getByTestId('menu-bar-item-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('menu-bar-item-item-2')).toBeInTheDocument();
  });

  it('passes isActive true for the selected item', () => {
    const menuItems = [createMenuItem('item-1', 'First'), createMenuItem('item-2', 'Second')];

    render(
      <MenuBarItemList
        {...defaultProps}
        menuItems={menuItems}
        isSelected="item-1"
      />,
    );

    expect(screen.getByTestId('menu-bar-item-item-1')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('menu-bar-item-item-2')).toHaveAttribute('data-active', 'false');
  });

  it('passes isExpanded true for expanded items', () => {
    const menuItems = [createMenuItem('item-1', 'First')];
    const expandedItems = new Set(['item-1']);

    render(
      <MenuBarItemList
        {...defaultProps}
        menuItems={menuItems}
        expandedItems={expandedItems}
      />,
    );

    expect(screen.getByTestId('menu-bar-item-item-1')).toHaveAttribute('data-expanded', 'true');
  });

  it('calls onToggleExpand with item id when toggled', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    const menuItems = [createMenuItem('item-1', 'First')];

    render(
      <MenuBarItemList
        {...defaultProps}
        menuItems={menuItems}
        onToggleExpand={handleToggle}
      />,
    );

    await user.click(screen.getByTestId('toggle-item-1'));

    expect(handleToggle).toHaveBeenCalledWith('item-1');
  });

  it('calls onCloseMobileMenu when triggered', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const menuItems = [createMenuItem('item-1', 'First')];

    render(
      <MenuBarItemList
        {...defaultProps}
        menuItems={menuItems}
        onCloseMobileMenu={handleClose}
      />,
    );

    await user.click(screen.getByTestId('close-mobile-item-1'));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
