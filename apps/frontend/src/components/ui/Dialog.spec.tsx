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

vi.mock('@radix-ui/react-dialog', () => {
  const Root = ({ children, open, onOpenChange }: any) => <div data-testid="dialog-root">{open ? children : null}</div>;
  const Trigger = ({ children, ...props }: any) => (
    <button
      data-testid="dialog-trigger"
      {...props}
    >
      {children}
    </button>
  );
  const Portal = ({ children }: any) => <div data-testid="dialog-portal">{children}</div>;
  const Overlay = ({ children, className, ...props }: any) => (
    <div
      data-testid="dialog-overlay"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
  Overlay.displayName = 'DialogOverlay';
  const Content = ({ children, className, ...props }: any) => (
    <div
      data-testid="dialog-content"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
  Content.displayName = 'DialogContent';
  const Close = ({ children, className }: any) => (
    <button
      data-testid="dialog-close"
      className={className}
    >
      {children}
    </button>
  );
  const Title = ({ children, className, ...props }: any) => (
    <h2
      data-testid="dialog-title"
      className={className}
      {...props}
    >
      {children}
    </h2>
  );
  Title.displayName = 'DialogTitle';
  const Description = ({ children, className, ...props }: any) => (
    <p
      data-testid="dialog-description"
      className={className}
      {...props}
    >
      {children}
    </p>
  );
  Description.displayName = 'DialogDescription';
  return { Root, Trigger, Portal, Overlay, Content, Close, Title, Description };
});

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) =>
    args
      .flatMap((arg: any) => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object' && arg !== null) {
          return Object.entries(arg)
            .filter(([, v]) => v)
            .map(([k]) => k);
        }
        return [];
      })
      .filter(Boolean)
      .join(' '),
}));

vi.mock('@/i18n', () => ({
  default: { t: (key: string) => key },
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './Dialog';

describe('Dialog', () => {
  it('renders dialog content when open', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>My Dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText('My Dialog')).toBeInTheDocument();
  });

  it('does not render dialog content when closed', () => {
    render(
      <Dialog open={false}>
        <DialogContent>
          <DialogTitle>Hidden</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('renders close button by default', () => {
    render(
      <Dialog open>
        <DialogContent>Body</DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId('dialog-close')).toBeInTheDocument();
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>Body</DialogContent>
      </Dialog>,
    );
    expect(screen.queryByTestId('dialog-close')).not.toBeInTheDocument();
  });
});
