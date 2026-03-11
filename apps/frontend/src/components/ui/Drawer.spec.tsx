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

vi.mock('vaul', () => {
  const Root = ({ children, shouldScaleBackground, ...props }: any) => (
    <div
      data-testid="drawer-root"
      data-scale={shouldScaleBackground}
      {...props}
    >
      {children}
    </div>
  );
  const Trigger = ({ children, ...props }: any) => (
    <button
      data-testid="drawer-trigger"
      {...props}
    >
      {children}
    </button>
  );
  const Portal = ({ children }: any) => <div data-testid="drawer-portal">{children}</div>;
  const Close = ({ children, ...props }: any) => (
    <button
      data-testid="drawer-close"
      {...props}
    >
      {children}
    </button>
  );
  const Overlay = ({ children, className, ...props }: any) => (
    <div
      data-testid="drawer-overlay"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
  Overlay.displayName = 'DrawerOverlay';
  const Content = ({ children, className, ...props }: any) => (
    <div
      data-testid="drawer-content"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
  Content.displayName = 'DrawerContent';
  const Title = ({ children, className, ...props }: any) => (
    <h2
      data-testid="drawer-title"
      className={className}
      {...props}
    >
      {children}
    </h2>
  );
  Title.displayName = 'DrawerTitle';
  const Description = ({ children, className, ...props }: any) => (
    <p
      data-testid="drawer-description"
      className={className}
      {...props}
    >
      {children}
    </p>
  );
  Description.displayName = 'DrawerDescription';
  return { Drawer: { Root, Trigger, Portal, Close, Overlay, Content, Title, Description } };
});

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
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerOverlay,
} from './Drawer';

describe('Drawer', () => {
  it('renders the root with shouldScaleBackground defaulting to true', () => {
    render(<Drawer>content</Drawer>);
    const root = screen.getByTestId('drawer-root');
    expect(root).toBeInTheDocument();
    expect(root.getAttribute('data-scale')).toBe('true');
  });

  it('passes shouldScaleBackground as false when provided', () => {
    render(<Drawer shouldScaleBackground={false}>content</Drawer>);
    expect(screen.getByTestId('drawer-root').getAttribute('data-scale')).toBe('false');
  });
});

describe('DrawerContent', () => {
  it('renders children inside a portal with an overlay', () => {
    render(
      <DrawerContent>
        <span>Inner content</span>
      </DrawerContent>,
    );
    expect(screen.getByTestId('drawer-portal')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-overlay')).toBeInTheDocument();
    expect(screen.getByText('Inner content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<DrawerContent className="custom-drawer" />);
    expect(screen.getByTestId('drawer-content').className).toContain('custom-drawer');
  });
});

describe('DrawerHeader and DrawerFooter', () => {
  it('renders header with children', () => {
    render(
      <DrawerHeader data-testid="header">
        <span>Header text</span>
      </DrawerHeader>,
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Header text')).toBeInTheDocument();
  });

  it('renders footer with children', () => {
    render(
      <DrawerFooter data-testid="footer">
        <span>Footer text</span>
      </DrawerFooter>,
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });
});

describe('DrawerTitle and DrawerDescription', () => {
  it('renders title and description with text', () => {
    render(
      <>
        <DrawerTitle>My Title</DrawerTitle>
        <DrawerDescription>My Description</DrawerDescription>
      </>,
    );
    expect(screen.getByTestId('drawer-title')).toHaveTextContent('My Title');
    expect(screen.getByTestId('drawer-description')).toHaveTextContent('My Description');
  });
});
