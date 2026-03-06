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
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  Button: ({ children, onClick, disabled, variant, size, type, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      type={type}
      {...props}
    >
      {children}
    </button>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DialogFooterButtons from './DialogFooterButtons';

describe('DialogFooterButtons', () => {
  it('renders submit and cancel buttons', () => {
    render(
      <DialogFooterButtons
        handleSubmit={vi.fn()}
        handleClose={vi.fn()}
      />,
    );
    expect(screen.getByText('common.save')).toBeInTheDocument();
    expect(screen.getByText('common.cancel')).toBeInTheDocument();
  });

  it('calls handleSubmit when submit button clicked', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(
      <DialogFooterButtons
        handleSubmit={handleSubmit}
        handleClose={vi.fn()}
      />,
    );

    await user.click(screen.getByText('common.save'));
    expect(handleSubmit).toHaveBeenCalledOnce();
  });

  it('calls handleClose when cancel button clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <DialogFooterButtons
        handleSubmit={vi.fn()}
        handleClose={handleClose}
      />,
    );

    await user.click(screen.getByText('common.cancel'));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('renders delete button when handleDelete is provided', () => {
    render(
      <DialogFooterButtons
        handleDelete={vi.fn()}
        handleClose={vi.fn()}
      />,
    );
    expect(screen.getByText('delete')).toBeInTheDocument();
  });

  it('disables submit button when disableSubmit is true', () => {
    render(
      <DialogFooterButtons
        handleSubmit={vi.fn()}
        disableSubmit
      />,
    );
    expect(screen.getByText('common.save')).toBeDisabled();
  });

  it('uses custom button text when provided', () => {
    render(
      <DialogFooterButtons
        handleSubmit={vi.fn()}
        handleClose={vi.fn()}
        submitButtonText="common.confirm"
        cancelButtonText="common.dismiss"
      />,
    );
    expect(screen.getByText('common.confirm')).toBeInTheDocument();
    expect(screen.getByText('common.dismiss')).toBeInTheDocument();
  });
});
