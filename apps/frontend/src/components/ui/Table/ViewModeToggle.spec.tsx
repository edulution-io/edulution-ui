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
  Button: ({ children, onClick, className, ...props }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@libs/common/constants/viewMode', () => ({
  default: { table: 'table', grid: 'grid' },
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewModeToggle from './ViewModeToggle';

describe('ViewModeToggle', () => {
  it('renders two toggle buttons', () => {
    const onViewModeChange = vi.fn();
    render(
      <ViewModeToggle
        viewMode="table"
        onViewModeChange={onViewModeChange}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('calls onViewModeChange with table when table button is clicked', async () => {
    const user = userEvent.setup();
    const onViewModeChange = vi.fn();
    render(
      <ViewModeToggle
        viewMode="grid"
        onViewModeChange={onViewModeChange}
      />,
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    expect(onViewModeChange).toHaveBeenCalledWith('table');
  });

  it('calls onViewModeChange with grid when grid button is clicked', async () => {
    const user = userEvent.setup();
    const onViewModeChange = vi.fn();
    render(
      <ViewModeToggle
        viewMode="table"
        onViewModeChange={onViewModeChange}
      />,
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);
    expect(onViewModeChange).toHaveBeenCalledWith('grid');
  });

  it('renders tooltip content for table and grid views', () => {
    const onViewModeChange = vi.fn();
    render(
      <ViewModeToggle
        viewMode="table"
        onViewModeChange={onViewModeChange}
      />,
    );

    expect(screen.getByText('common.tableView')).toBeInTheDocument();
    expect(screen.getByText('common.gridView')).toBeInTheDocument();
  });

  it('applies bg-accent class to active table mode button', () => {
    const onViewModeChange = vi.fn();
    render(
      <ViewModeToggle
        viewMode="table"
        onViewModeChange={onViewModeChange}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0].className).toContain('bg-accent');
  });
});
