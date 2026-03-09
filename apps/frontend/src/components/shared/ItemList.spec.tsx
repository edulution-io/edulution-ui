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

vi.mock('@/components/ui/ScrollArea', () => ({
  ScrollArea: ({ children, ...props }: any) => (
    <div
      data-testid="scroll-area"
      {...props}
    >
      {children}
    </div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import ItemList from './ItemList';

describe('ItemList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when items array is empty', () => {
    const { container } = render(<ItemList items={[]} />);

    expect(container.innerHTML).toBe('');
  });

  it('renders single item as a paragraph without scroll area', () => {
    const items = [{ id: '1', name: 'Only Item' }];

    render(<ItemList items={items} />);

    expect(screen.getByText('Only Item')).toBeInTheDocument();
    expect(screen.queryByTestId('scroll-area')).not.toBeInTheDocument();
  });

  it('renders multiple items inside a scroll area', () => {
    const items = [
      { id: '1', name: 'First' },
      { id: '2', name: 'Second' },
      { id: '3', name: 'Third' },
    ];

    render(<ItemList items={items} />);

    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('uses item.id as key for each rendered item', () => {
    const items = [
      { id: 'abc', name: 'Item A' },
      { id: 'def', name: 'Item B' },
    ];

    const { container } = render(<ItemList items={items} />);

    const itemDivs = container.querySelectorAll('[class*="truncate"]');
    expect(itemDivs).toHaveLength(2);
  });
});
