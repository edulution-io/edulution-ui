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

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import SelectedRowsCount from './SelectedRowsCount';

describe('SelectedRowsCount', () => {
  it('renders items count when no rows are selected', () => {
    render(
      <SelectedRowsCount
        applicationName="users"
        selectedRowsCount={0}
        filteredRowCount={5}
      />,
    );

    expect(screen.getByText('users.items')).toBeInTheDocument();
  });

  it('renders singular item label when filteredRowCount is 1 and no selection', () => {
    render(
      <SelectedRowsCount
        applicationName="users"
        selectedRowsCount={0}
        filteredRowCount={1}
      />,
    );

    expect(screen.getByText('users.item')).toBeInTheDocument();
  });

  it('renders rowsSelected label when rows are selected and filteredRowCount > 1', () => {
    render(
      <SelectedRowsCount
        applicationName="users"
        selectedRowsCount={3}
        filteredRowCount={10}
      />,
    );

    expect(screen.getByText('users.rowsSelected')).toBeInTheDocument();
  });

  it('renders singular rowSelected label when filteredRowCount is 1 and selected', () => {
    render(
      <SelectedRowsCount
        applicationName="users"
        selectedRowsCount={1}
        filteredRowCount={1}
      />,
    );

    expect(screen.getByText('users.rowSelected')).toBeInTheDocument();
  });

  it('applies muted-foreground text styling', () => {
    const { container } = render(
      <SelectedRowsCount
        applicationName="users"
        selectedRowsCount={0}
        filteredRowCount={5}
      />,
    );

    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('text-muted-foreground');
  });
});
