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

vi.mock('@radix-ui/react-popover', () => {
  const Root = ({ children }: any) => <div data-testid="popover-root">{children}</div>;
  const Trigger = ({ children, ...props }: any) => (
    <button
      data-testid="popover-trigger"
      {...props}
    >
      {children}
    </button>
  );
  const Anchor = ({ children }: any) => <div data-testid="popover-anchor">{children}</div>;
  const Portal = ({ children }: any) => <div data-testid="popover-portal">{children}</div>;
  const Content = ({ children, className, align, sideOffset, ...props }: any) => (
    <div
      data-testid="popover-content"
      className={className}
      data-align={align}
      data-side-offset={sideOffset}
      {...props}
    >
      {children}
    </div>
  );
  Content.displayName = 'PopoverContent';
  return { Root, Trigger, Anchor, Portal, Content };
});

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './Popover';

describe('Popover', () => {
  it('renders trigger and content', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Popover body')).toBeInTheDocument();
  });

  it('applies custom className to PopoverContent', () => {
    render(
      <Popover>
        <PopoverContent className="w-80">Content</PopoverContent>
      </Popover>,
    );
    expect(screen.getByTestId('popover-content').className).toContain('w-80');
  });

  it('renders PopoverAnchor', () => {
    render(
      <Popover>
        <PopoverAnchor>
          <span>Anchor element</span>
        </PopoverAnchor>
      </Popover>,
    );
    expect(screen.getByText('Anchor element')).toBeInTheDocument();
  });
});
