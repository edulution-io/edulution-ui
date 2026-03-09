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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, params?: any) => key }),
}));

vi.mock('@/components/ui/AdaptiveDialog', () => ({
  default: ({ isOpen, title, body, footer }: any) =>
    isOpen ? (
      <div data-testid="adaptive-dialog">
        <div data-testid="dialog-title">{title}</div>
        <div data-testid="dialog-body">{body}</div>
        <div data-testid="dialog-footer">{footer}</div>
      </div>
    ) : null,
}));

vi.mock('@/components/shared/ItemList', () => ({
  default: ({ items }: { items: any[] }) => (
    <ul data-testid="item-list">
      {items.map((item: any) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  ),
}));

vi.mock('@/components/ui/DialogFooterButtons', () => ({
  default: ({ handleClose, handleSubmit, submitButtonText, disableSubmit }: any) => (
    <div data-testid="footer-buttons">
      <button
        type="button"
        data-testid="cancel-btn"
        onClick={handleClose}
      >
        Cancel
      </button>
      <button
        type="button"
        data-testid="submit-btn"
        onClick={handleSubmit}
        disabled={disableSubmit}
      >
        {submitButtonText}
      </button>
    </div>
  ),
}));

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const DEFAULT_ITEMS = [
  { id: '1', name: 'File A' },
  { id: '2', name: 'File B' },
];

describe('DeleteConfirmationDialog', () => {
  it('renders dialog when open', () => {
    render(
      <DeleteConfirmationDialog
        isOpen
        onOpenChange={vi.fn()}
        items={DEFAULT_ITEMS}
        onConfirmDelete={vi.fn().mockResolvedValue(undefined)}
        titleTranslationKey="dialog.deleteTitle"
        messageTranslationKey="dialog.deleteMessage"
      />,
    );
    expect(screen.getByTestId('adaptive-dialog')).toBeInTheDocument();
  });

  it('does not render dialog when closed', () => {
    render(
      <DeleteConfirmationDialog
        isOpen={false}
        onOpenChange={vi.fn()}
        items={DEFAULT_ITEMS}
        onConfirmDelete={vi.fn().mockResolvedValue(undefined)}
        titleTranslationKey="dialog.deleteTitle"
        messageTranslationKey="dialog.deleteMessage"
      />,
    );
    expect(screen.queryByTestId('adaptive-dialog')).not.toBeInTheDocument();
  });

  it('renders items in the list', () => {
    render(
      <DeleteConfirmationDialog
        isOpen
        onOpenChange={vi.fn()}
        items={DEFAULT_ITEMS}
        onConfirmDelete={vi.fn().mockResolvedValue(undefined)}
        titleTranslationKey="dialog.deleteTitle"
        messageTranslationKey="dialog.deleteMessage"
      />,
    );
    expect(screen.getByText('File A')).toBeInTheDocument();
    expect(screen.getByText('File B')).toBeInTheDocument();
  });

  it('calls onConfirmDelete when submit button is clicked', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <DeleteConfirmationDialog
        isOpen
        onOpenChange={vi.fn()}
        items={DEFAULT_ITEMS}
        onConfirmDelete={handleDelete}
        titleTranslationKey="dialog.deleteTitle"
        messageTranslationKey="dialog.deleteMessage"
      />,
    );

    await user.click(screen.getByTestId('submit-btn'));
    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalledOnce();
    });
  });

  it('shows error message when error prop is set', () => {
    render(
      <DeleteConfirmationDialog
        isOpen
        onOpenChange={vi.fn()}
        items={DEFAULT_ITEMS}
        onConfirmDelete={vi.fn().mockResolvedValue(undefined)}
        error={new Error('Something went wrong')}
        titleTranslationKey="dialog.deleteTitle"
        messageTranslationKey="dialog.deleteMessage"
      />,
    );
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });
});
