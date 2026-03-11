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
}));

vi.mock('@/components/shared/ActionTooltip', () => ({
  default: ({ trigger, tooltipText }: any) => (
    <div
      data-testid="action-tooltip"
      data-tooltip={tooltipText}
    >
      {trigger}
    </div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WindowControlBaseButton from './WindowControlBaseButton';

describe('WindowControlBaseButton', () => {
  const defaultProps = {
    onClick: vi.fn(),
    tooltipTranslationId: 'common.close',
    children: <span data-testid="child">X</span>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button with children', () => {
    render(<WindowControlBaseButton {...defaultProps} />);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders with translated tooltip text', () => {
    render(<WindowControlBaseButton {...defaultProps} />);
    expect(screen.getByTestId('action-tooltip')).toHaveAttribute('data-tooltip', 'common.close');
  });

  it('calls onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <WindowControlBaseButton
        {...defaultProps}
        onClick={handleClick}
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <WindowControlBaseButton
        {...defaultProps}
        onClick={handleClick}
        disabled
      />,
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies disabled styling when disabled', () => {
    render(
      <WindowControlBaseButton
        {...defaultProps}
        disabled
      />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button').className).toContain('cursor-not-allowed');
  });

  it('applies hover styling when not disabled', () => {
    render(<WindowControlBaseButton {...defaultProps} />);
    expect(screen.getByRole('button').className).toContain('hover:bg-gray-600');
  });

  it('applies custom className', () => {
    render(
      <WindowControlBaseButton
        {...defaultProps}
        className="custom-class"
      />,
    );
    expect(screen.getByRole('button').className).toContain('custom-class');
  });
});
