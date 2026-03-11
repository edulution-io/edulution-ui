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

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));

vi.mock('./WindowControlBaseButton', () => ({
  default: ({ onClick, tooltipTranslationId, className, children }: any) => (
    <button
      data-testid="window-control-btn"
      data-tooltip={tooltipTranslationId}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CloseButton from './CloseButton';

describe('CloseButton', () => {
  it('renders the close button', () => {
    render(<CloseButton handleClose={vi.fn()} />);
    expect(screen.getByTestId('window-control-btn')).toBeInTheDocument();
  });

  it('renders with the close icon', () => {
    render(<CloseButton handleClose={vi.fn()} />);
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  it('passes common.close as tooltip translation id', () => {
    render(<CloseButton handleClose={vi.fn()} />);
    expect(screen.getByTestId('window-control-btn')).toHaveAttribute('data-tooltip', 'common.close');
  });

  it('calls handleClose when clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<CloseButton handleClose={handleClose} />);

    await user.click(screen.getByTestId('window-control-btn'));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('applies red background classes', () => {
    render(<CloseButton handleClose={vi.fn()} />);
    const btn = screen.getByTestId('window-control-btn');
    expect(btn.className).toContain('bg-ciRed');
    expect(btn.className).toContain('text-white');
  });

  it('merges custom className', () => {
    render(
      <CloseButton
        handleClose={vi.fn()}
        className="extra-class"
      />,
    );
    expect(screen.getByTestId('window-control-btn').className).toContain('extra-class');
  });
});
