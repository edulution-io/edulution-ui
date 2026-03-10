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

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));
vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faTableCells: { iconName: 'table-cells', prefix: 'fas' },
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
  Button: ({ children, onClick, ...props }: any) => (
    <button
      data-testid="numpad-toggle-btn"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));
vi.mock('input-otp', () => ({
  REGEXP_ONLY_DIGITS: '^\\d+$',
}));

let lastOnChange: ((val: string) => void) | undefined;
let lastOnComplete: (() => void) | undefined;

vi.mock('../ui/InputOtpSH', () => ({
  InputOTPSH: ({ children, onChange, onComplete, value, maxLength }: any) => {
    lastOnChange = onChange;
    lastOnComplete = onComplete;
    return (
      <div
        data-testid="input-otp"
        data-value={value}
        data-maxlength={maxLength}
      >
        {children}
      </div>
    );
  },
  InputOTPGroupSH: ({ children }: any) => <div data-testid="input-otp-group">{children}</div>,
  InputOTPSlotSH: ({ index, variant, type }: any) => (
    <div
      data-testid={`input-otp-slot-${index}`}
      data-variant={variant}
      data-type={type}
    />
  ),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OtpInputFieldWithNumPad from './OtpInputFieldWithNumPad';

describe('OtpInputFieldWithNumPad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastOnChange = undefined;
    lastOnComplete = undefined;
  });

  it('renders OTP input with the correct number of slots', () => {
    render(
      <OtpInputFieldWithNumPad
        totp=""
        setTotp={vi.fn()}
        maxLength={4}
      />,
    );
    expect(screen.getByTestId('input-otp')).toHaveAttribute('data-maxlength', '4');
    expect(screen.getByTestId('input-otp-slot-0')).toBeInTheDocument();
    expect(screen.getByTestId('input-otp-slot-3')).toBeInTheDocument();
  });

  it('defaults to 6 slots when maxLength not provided', () => {
    render(
      <OtpInputFieldWithNumPad
        totp=""
        setTotp={vi.fn()}
      />,
    );
    expect(screen.getByTestId('input-otp')).toHaveAttribute('data-maxlength', '6');
    expect(screen.getByTestId('input-otp-slot-5')).toBeInTheDocument();
  });

  it('calls setTotp when onChange receives digits', () => {
    const setTotp = vi.fn();
    render(
      <OtpInputFieldWithNumPad
        totp=""
        setTotp={setTotp}
      />,
    );
    lastOnChange?.('123');
    expect(setTotp).toHaveBeenCalledWith('123');
  });

  it('does not call setTotp for non-digit input', () => {
    const setTotp = vi.fn();
    render(
      <OtpInputFieldWithNumPad
        totp=""
        setTotp={setTotp}
      />,
    );
    lastOnChange?.('abc');
    expect(setTotp).not.toHaveBeenCalled();
  });

  it('renders numpad toggle button when setShowNumPad is provided', () => {
    const setShowNumPad = vi.fn();
    render(
      <OtpInputFieldWithNumPad
        totp=""
        setTotp={vi.fn()}
        setShowNumPad={setShowNumPad}
      />,
    );
    const btn = screen.getByTestId('numpad-toggle-btn');
    fireEvent.click(btn);
    expect(setShowNumPad).toHaveBeenCalled();
  });

  it('does not render numpad toggle button when setShowNumPad is not provided', () => {
    render(
      <OtpInputFieldWithNumPad
        totp=""
        setTotp={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('numpad-toggle-btn')).not.toBeInTheDocument();
  });
});
