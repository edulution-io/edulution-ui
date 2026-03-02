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
vi.mock('@/components/ui/Sidebar/SidebarMenuItems/SidebarItemIcon', () => ({
  default: ({ title, isHovered, isSelected }: any) => (
    <span
      data-testid="sidebar-item-icon"
      data-hovered={isHovered}
      data-selected={isSelected}
      data-title={title}
    />
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import SidebarItemPopover from './SidebarItemPopover';

const defaultProps = {
  anchorRect: new DOMRect(0, 100, 64, 56),
  color: 'bg-blue-500',
  title: 'Files',
  iconSrc: '/icons/files.svg',
  isHovered: true,
};

describe('SidebarItemPopover', () => {
  it('renders the title text', () => {
    render(<SidebarItemPopover {...defaultProps} />);

    expect(screen.getByText('Files')).toBeInTheDocument();
  });

  it('renders SidebarItemIcon with correct props', () => {
    render(<SidebarItemPopover {...defaultProps} />);

    const icon = screen.getByTestId('sidebar-item-icon');
    expect(icon).toHaveAttribute('data-hovered', 'true');
    expect(icon).toHaveAttribute('data-selected', 'true');
  });

  it('portals content to document.body', () => {
    render(<SidebarItemPopover {...defaultProps} />);

    const popoverTitle = screen.getByText('Files');
    expect(popoverTitle.closest('body')).toBeTruthy();
  });

  it('applies fixed positioning with anchor rect coordinates', () => {
    render(<SidebarItemPopover {...defaultProps} />);

    const popoverTitle = screen.getByText('Files');
    const container = popoverTitle.closest('div[style]') as HTMLElement;
    expect(container.style.position).toBe('fixed');
    expect(container.style.top).toBe('100px');
  });

  it('applies the color class to the container', () => {
    render(<SidebarItemPopover {...defaultProps} />);

    const popoverTitle = screen.getByText('Files');
    const container = popoverTitle.closest('div[style]') as HTMLElement;
    expect(container.className).toContain('bg-blue-500');
  });
});
