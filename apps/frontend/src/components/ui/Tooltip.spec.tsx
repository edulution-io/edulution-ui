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

vi.mock('@radix-ui/react-tooltip', () => {
  const Provider = ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>;
  const Root = ({ children }: any) => <div data-testid="tooltip-root">{children}</div>;
  const Trigger = ({ children }: any) => <div data-testid="tooltip-trigger">{children}</div>;
  const Portal = ({ children }: any) => <div data-testid="tooltip-portal">{children}</div>;
  const Content = ({ children, className, sideOffset, ...props }: any) => (
    <div
      data-testid="tooltip-content"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
  Content.displayName = 'TooltipContent';
  return { Provider, Root, Trigger, Portal, Content };
});

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';

describe('Tooltip', () => {
  it('renders TooltipProvider wrapper', () => {
    render(
      <TooltipProvider>
        <div>Content</div>
      </TooltipProvider>,
    );
    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
  });

  it('renders Tooltip with trigger and content', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('applies custom className to TooltipContent', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="custom-tooltip">Info</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByTestId('tooltip-content').className).toContain('custom-tooltip');
  });
});
