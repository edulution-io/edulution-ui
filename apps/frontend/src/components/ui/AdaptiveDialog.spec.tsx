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

const mockUseMedia = vi.fn();

vi.mock('@/hooks/useMedia', () => ({
  default: () => mockUseMedia(),
}));

vi.mock('@/components/ui/Sheet', () => ({
  Sheet: ({ children, open }: any) => <div data-testid="sheet-root">{open ? children : null}</div>,
  SheetTrigger: ({ children }: any) => <div data-testid="sheet-trigger">{children}</div>,
  SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: any) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: any) => <div data-testid="sheet-title">{children}</div>,
  SheetFooter: ({ children }: any) => <div data-testid="sheet-footer">{children}</div>,
  SheetDescription: (props: any) => <div data-testid="sheet-description" />,
}));

vi.mock('@/components/ui/Dialog', () => ({
  Dialog: ({ children, open }: any) => <div data-testid="dialog-root">{open ? children : null}</div>,
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogDescription: (props: any) => <div data-testid="dialog-description" />,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import AdaptiveDialog from './AdaptiveDialog';

describe('AdaptiveDialog', () => {
  beforeEach(() => {
    mockUseMedia.mockReturnValue({ isMobileView: false });
  });

  it('renders Dialog on desktop', () => {
    render(
      <AdaptiveDialog
        isOpen
        title="Desktop Title"
        body={<p>Body content</p>}
      />,
    );
    expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
    expect(screen.getByText('Desktop Title')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('renders Sheet on mobile', () => {
    mockUseMedia.mockReturnValue({ isMobileView: true });
    render(
      <AdaptiveDialog
        isOpen
        title="Mobile Title"
        body={<p>Mobile body</p>}
      />,
    );
    expect(screen.getByTestId('sheet-root')).toBeInTheDocument();
    expect(screen.getByText('Mobile Title')).toBeInTheDocument();
    expect(screen.getByText('Mobile body')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <AdaptiveDialog
        isOpen
        title="With Footer"
        body={<p>Body</p>}
        footer={<button type="button">Save</button>}
      />,
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('does not render content when isOpen is false', () => {
    render(
      <AdaptiveDialog
        isOpen={false}
        title="Hidden"
        body={<p>Invisible</p>}
      />,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });
});
