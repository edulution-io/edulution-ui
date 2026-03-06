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
  cn: (...args: any[]) =>
    args
      .flatMap((a: any) => {
        if (typeof a === 'string') return a;
        if (a && typeof a === 'object')
          return Object.entries(a)
            .filter(([, v]) => v)
            .map(([k]) => k);
        return [];
      })
      .filter(Boolean)
      .join(' '),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from './Table';

describe('Table', () => {
  it('renders a table element', () => {
    render(<Table data-testid="table" />);
    expect(screen.getByTestId('table').tagName).toBe('TABLE');
  });

  it('applies custom className', () => {
    render(
      <Table
        data-testid="table"
        className="custom-table"
      />,
    );
    expect(screen.getByTestId('table').className).toContain('custom-table');
  });
});

describe('TableHeader', () => {
  it('renders a thead element', () => {
    render(
      <table>
        <TableHeader data-testid="thead" />
      </table>,
    );
    expect(screen.getByTestId('thead').tagName).toBe('THEAD');
  });
});

describe('TableBody', () => {
  it('renders a tbody element', () => {
    render(
      <table>
        <TableBody data-testid="tbody" />
      </table>,
    );
    expect(screen.getByTestId('tbody').tagName).toBe('TBODY');
  });
});

describe('TableFooter', () => {
  it('renders a tfoot element', () => {
    render(
      <table>
        <TableFooter data-testid="tfoot" />
      </table>,
    );
    expect(screen.getByTestId('tfoot').tagName).toBe('TFOOT');
  });
});

describe('TableRow', () => {
  it('renders a tr element with default variant', () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="row">
            <td>Cell</td>
          </TableRow>
        </tbody>
      </table>,
    );
    const row = screen.getByTestId('row');
    expect(row.tagName).toBe('TR');
    expect(row.className).toContain('data-[state=selected]:bg-muted-light');
  });

  it('renders with dialog variant', () => {
    render(
      <table>
        <tbody>
          <TableRow
            data-testid="row"
            variant="dialog"
          >
            <td>Cell</td>
          </TableRow>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('row').className).toContain('data-[state=selected]:bg-muted-light');
  });

  it('renders with none variant (no extra styling)', () => {
    render(
      <table>
        <tbody>
          <TableRow
            data-testid="row"
            variant="none"
          >
            <td>Cell</td>
          </TableRow>
        </tbody>
      </table>,
    );
    const row = screen.getByTestId('row');
    expect(row.className).toContain('truncate');
  });
});

describe('TableHead', () => {
  it('renders a th element with children', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead>Name</TableHead>
          </tr>
        </thead>
      </table>,
    );
    expect(screen.getByText('Name').tagName).toBe('TH');
  });
});

describe('TableCell', () => {
  it('renders a td element with children', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell>Value</TableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText('Value').tagName).toBe('TD');
  });
});

describe('TableCaption', () => {
  it('renders a caption element', () => {
    render(
      <table>
        <TableCaption>My caption</TableCaption>
      </table>,
    );
    expect(screen.getByText('My caption').tagName).toBe('CAPTION');
  });
});
