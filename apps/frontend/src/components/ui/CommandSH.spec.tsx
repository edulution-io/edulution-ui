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

vi.mock('cmdk', () => {
  const Command = React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="cmdk-root"
      className={className}
      {...props}
    >
      {children}
    </div>
  ));
  Command.displayName = 'Command';
  Command.Input = React.forwardRef(({ className, ...props }: any, ref: any) => (
    <input
      ref={ref}
      data-testid="cmdk-input"
      className={className}
      {...props}
    />
  ));
  Command.Input.displayName = 'CommandInput';
  Command.List = React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="cmdk-list"
      className={className}
      {...props}
    >
      {children}
    </div>
  ));
  Command.List.displayName = 'CommandList';
  Command.Empty = React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="cmdk-empty"
      className={className}
      {...props}
    >
      {children}
    </div>
  ));
  Command.Empty.displayName = 'CommandEmpty';
  Command.Group = React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="cmdk-group"
      className={className}
      {...props}
    >
      {children}
    </div>
  ));
  Command.Group.displayName = 'CommandGroup';
  Command.Item = React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="cmdk-item"
      className={className}
      {...props}
    >
      {children}
    </div>
  ));
  Command.Item.displayName = 'CommandItem';
  Command.Separator = React.forwardRef(({ className, ...props }: any, ref: any) => (
    <hr
      ref={ref}
      data-testid="cmdk-separator"
      className={className}
      {...props}
    />
  ));
  Command.Separator.displayName = 'CommandSeparator';
  return { Command };
});

vi.mock('@radix-ui/react-dialog', () => ({
  DialogProps: {},
}));

vi.mock('@/components/ui/Dialog', () => ({
  Dialog: ({ children, ...props }: any) => (
    <div
      data-testid="dialog"
      {...props}
    >
      {children}
    </div>
  ),
  DialogContent: ({ children, className, ...props }: any) => (
    <div
      data-testid="dialog-content"
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));

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
import {
  CommandSH,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandDialog,
} from './CommandSH';

describe('CommandSH', () => {
  it('renders the command root with children', () => {
    render(<CommandSH>content</CommandSH>);
    expect(screen.getByTestId('cmdk-root')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CommandSH className="custom-cmd" />);
    expect(screen.getByTestId('cmdk-root').className).toContain('custom-cmd');
  });
});

describe('CommandInput', () => {
  it('renders an input with the search icon', () => {
    render(<CommandInput placeholder="Search..." />);
    expect(screen.getByTestId('cmdk-input')).toBeInTheDocument();
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  it('forwards placeholder prop', () => {
    render(<CommandInput placeholder="Type here" />);
    expect(screen.getByTestId('cmdk-input').getAttribute('placeholder')).toBe('Type here');
  });
});

describe('CommandList, CommandEmpty, CommandGroup, CommandItem', () => {
  it('renders list, empty, group, and item', () => {
    render(
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>
        <CommandGroup>
          <CommandItem>Item 1</CommandItem>
        </CommandGroup>
      </CommandList>,
    );
    expect(screen.getByTestId('cmdk-list')).toBeInTheDocument();
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByTestId('cmdk-group')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});

describe('CommandShortcut', () => {
  it('renders a span with text', () => {
    render(<CommandShortcut>Ctrl+K</CommandShortcut>);
    expect(screen.getByText('Ctrl+K')).toBeInTheDocument();
  });
});

describe('CommandSeparator', () => {
  it('renders a separator', () => {
    render(<CommandSeparator />);
    expect(screen.getByTestId('cmdk-separator')).toBeInTheDocument();
  });
});

describe('CommandDialog', () => {
  it('renders children inside dialog and command', () => {
    render(<CommandDialog open>dialog content</CommandDialog>);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('dialog content')).toBeInTheDocument();
  });
});
