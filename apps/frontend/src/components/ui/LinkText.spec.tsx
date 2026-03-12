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
import LinkText from './LinkText';

describe('LinkText', () => {
  it('renders an anchor with correct href', () => {
    render(
      <LinkText
        to="https://example.com"
        title="Example"
      >
        Click me
      </LinkText>,
    );
    const link = screen.getByRole('link', { name: 'Click me' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('opens in new tab with noopener noreferrer', () => {
    render(
      <LinkText
        to="https://example.com"
        title="Example"
      >
        Link
      </LinkText>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('sets title attribute', () => {
    render(
      <LinkText
        to="https://example.com"
        title="My Title"
      >
        Link
      </LinkText>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('title', 'My Title');
  });

  it('renders children content', () => {
    render(
      <LinkText
        to="/docs"
        title="Docs"
      >
        <span data-testid="child">Documentation</span>
      </LinkText>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('falls back to # when to is empty', () => {
    render(
      <LinkText
        to=""
        title="Empty"
      >
        Fallback
      </LinkText>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '#');
  });
});
