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

vi.mock('@radix-ui/react-scroll-area', () => {
  const Root = ({ children, className, ...props }: any) => (
    <div
      data-testid="scrollarea-root"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
  Root.displayName = 'ScrollArea';
  const Viewport = ({ children, className }: any) => (
    <div
      data-testid="scrollarea-viewport"
      className={className}
    >
      {children}
    </div>
  );
  const ScrollAreaScrollbar = ({ children, className, orientation, ...props }: any) => (
    <div
      data-testid="scrollarea-scrollbar"
      className={className}
      data-orientation={orientation}
      {...props}
    >
      {children}
    </div>
  );
  ScrollAreaScrollbar.displayName = 'ScrollAreaScrollbar';
  const ScrollAreaThumb = ({ className }: any) => (
    <div
      data-testid="scrollarea-thumb"
      className={className}
    />
  );
  const Corner = () => <div data-testid="scrollarea-corner" />;
  return { Root, Viewport, ScrollAreaScrollbar, ScrollAreaThumb, Corner };
});

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScrollArea, ScrollBar } from './ScrollArea';

describe('ScrollArea', () => {
  it('renders children inside the scroll area', () => {
    render(
      <ScrollArea>
        <p>Scrollable content</p>
      </ScrollArea>,
    );
    expect(screen.getByText('Scrollable content')).toBeInTheDocument();
  });

  it('applies custom className to the root', () => {
    render(
      <ScrollArea className="h-[200px]">
        <p>Content</p>
      </ScrollArea>,
    );
    expect(screen.getByTestId('scrollarea-root').className).toContain('h-[200px]');
  });

  it('renders ScrollBar with vertical orientation by default', () => {
    render(
      <ScrollArea>
        <p>Content</p>
      </ScrollArea>,
    );
    const scrollbar = screen.getByTestId('scrollarea-scrollbar');
    expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
  });
});
