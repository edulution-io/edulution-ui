/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
