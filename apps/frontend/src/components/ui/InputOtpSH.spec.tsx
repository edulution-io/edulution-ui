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
  FontAwesomeIcon: ({ className }: any) => (
    <span
      data-testid="fa-icon"
      className={className}
    />
  ),
}));

vi.mock('input-otp', () => {
  const OTPInput = React.forwardRef(({ className, containerClassName, children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="otp-input"
      className={containerClassName}
    >
      <input
        className={className}
        data-testid="otp-native-input"
        {...props}
      />
      {children}
    </div>
  ));
  OTPInput.displayName = 'OTPInput';

  const OTPInputContext = React.createContext({
    slots: Array.from({ length: 6 }, () => ({
      char: '',
      hasFakeCaret: false,
      isActive: false,
    })),
  });

  return { OTPInput, OTPInputContext };
});

vi.mock('@libs/ui/constants/commonClassNames', () => ({
  inputOTPSlotVariants: () => 'slot-base-class',
  inputOTPCaretVariants: () => 'caret-base-class',
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { InputOTPSH, InputOTPGroupSH, InputOTPSlotSH, InputOTPSeparatorSH } from './InputOtpSH';

describe('InputOTPSH', () => {
  it('renders the OTP input container', () => {
    render(<InputOTPSH maxLength={6} />);
    expect(screen.getByTestId('otp-input')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <InputOTPSH
        maxLength={6}
        className="custom-otp"
      />,
    );
    expect(screen.getByTestId('otp-native-input').className).toContain('custom-otp');
  });

  it('applies containerClassName', () => {
    render(
      <InputOTPSH
        maxLength={6}
        containerClassName="container-class"
      />,
    );
    expect(screen.getByTestId('otp-input').className).toContain('container-class');
  });
});

describe('InputOTPGroupSH', () => {
  it('renders a group container', () => {
    render(<InputOTPGroupSH data-testid="otp-group" />);
    expect(screen.getByTestId('otp-group')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <InputOTPGroupSH
        data-testid="otp-group"
        className="group-class"
      />,
    );
    expect(screen.getByTestId('otp-group').className).toContain('group-class');
  });

  it('renders children', () => {
    render(
      <InputOTPGroupSH>
        <span data-testid="child">slot</span>
      </InputOTPGroupSH>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('InputOTPSlotSH', () => {
  it('renders a slot', () => {
    render(
      <InputOTPSlotSH
        index={0}
        data-testid="otp-slot"
      />,
    );
    expect(screen.getByTestId('otp-slot')).toBeInTheDocument();
  });

  it('applies slot variant classes', () => {
    render(
      <InputOTPSlotSH
        index={0}
        data-testid="otp-slot"
      />,
    );
    expect(screen.getByTestId('otp-slot').className).toContain('slot-base-class');
  });

  it('applies custom className', () => {
    render(
      <InputOTPSlotSH
        index={0}
        data-testid="otp-slot"
        className="slot-custom"
      />,
    );
    expect(screen.getByTestId('otp-slot').className).toContain('slot-custom');
  });
});

describe('InputOTPSeparatorSH', () => {
  it('renders a separator with the separator role', () => {
    render(<InputOTPSeparatorSH />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('renders the minus icon', () => {
    render(<InputOTPSeparatorSH />);
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });
});
