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

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CardSH, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './CardSH';

describe('CardSH', () => {
  it('renders card with children', () => {
    render(<CardSH>Card body</CardSH>);
    expect(screen.getByText('Card body')).toBeInTheDocument();
  });

  it('applies custom className to card', () => {
    const { container } = render(<CardSH className="custom-card">Content</CardSH>);
    expect(container.firstElementChild!.className).toContain('custom-card');
  });

  it('renders full card composition', () => {
    render(
      <CardSH>
        <CardHeader>
          <CardTitle data-testid="card-title">Title</CardTitle>
          <CardDescription data-testid="card-desc">Description</CardDescription>
        </CardHeader>
        <CardContent data-testid="card-content">Body content</CardContent>
        <CardFooter data-testid="card-footer">Footer content</CardFooter>
      </CardSH>,
    );

    expect(screen.getByTestId('card-title')).toBeInTheDocument();
    expect(screen.getByTestId('card-desc')).toHaveTextContent('Description');
    expect(screen.getByTestId('card-content')).toHaveTextContent('Body content');
    expect(screen.getByTestId('card-footer')).toHaveTextContent('Footer content');
  });

  it('renders CardHeader with custom className', () => {
    const { container } = render(<CardHeader className="header-class">Header</CardHeader>);
    expect(container.firstElementChild!.className).toContain('header-class');
  });

  it('renders CardContent with custom className', () => {
    const { container } = render(<CardContent className="content-class">Content</CardContent>);
    expect(container.firstElementChild!.className).toContain('content-class');
  });
});
