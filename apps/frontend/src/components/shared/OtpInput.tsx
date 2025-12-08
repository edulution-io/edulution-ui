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

import React, { FC, Dispatch, SetStateAction } from 'react';
import { MdDialpad } from 'react-icons/md';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/InputOtp';
import { Button } from './Button';

type OtpInputProps = {
  totp: string;
  maxLength?: number;
  variant?: 'default' | 'dialog';
  type?: 'default' | 'pin';
  setTotp: (value: string) => void;
  onComplete?: () => void;
  setShowNumPad?: Dispatch<SetStateAction<boolean>>;
};

const OtpInput: FC<OtpInputProps> = ({
  totp,
  maxLength = 6,
  variant = 'default',
  type,
  setTotp,
  onComplete,
  setShowNumPad,
}) => (
  <div className="mb-3 flex items-center justify-center">
    <InputOTP
      autoFocus
      maxLength={maxLength}
      value={totp}
      onChange={(val) => {
        if (val === '' || new RegExp(REGEXP_ONLY_DIGITS).test(val)) {
          setTotp(val);
        }
      }}
      onComplete={onComplete ? () => onComplete() : undefined}
    >
      <InputOTPGroup>
        {Array.from({ length: maxLength }, (_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            variant={variant}
            type={type}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
    {setShowNumPad && (
      <Button
        variant="btn-outline"
        type="button"
        onClick={() => setShowNumPad((prev) => !prev)}
        className="ml-4 h-11 w-11 p-0 hover:bg-ciGrey/10"
      >
        <MdDialpad style={{ width: '18px', height: '18px' }} />
      </Button>
    )}
  </div>
);

export default OtpInput;
