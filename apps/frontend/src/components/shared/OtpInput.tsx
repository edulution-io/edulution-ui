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

import React from 'react';
import { MdDialpad } from 'react-icons/md';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/InputOtp';
import { Button } from './Button';

type OtpInputProps = {
  totp: string;
  variant?: 'default' | 'dialog';
  setTotp: (value: string) => void;
  onComplete?: () => void;
  setShowNumPad: React.Dispatch<React.SetStateAction<boolean>>;
};

const OtpInput: React.FC<OtpInputProps> = ({ totp, variant = 'default', setTotp, onComplete, setShowNumPad }) => (
  <div className="mb-3 flex items-center justify-center">
    <InputOTP
      autoFocus
      maxLength={6}
      value={totp}
      onChange={setTotp}
      onComplete={onComplete ? () => onComplete() : undefined}
    >
      <InputOTPGroup>
        <InputOTPSlot
          variant={variant}
          index={0}
        />
        <InputOTPSlot
          variant={variant}
          index={1}
        />
        <InputOTPSlot
          variant={variant}
          index={2}
        />
        <InputOTPSlot
          variant={variant}
          index={3}
        />
        <InputOTPSlot
          variant={variant}
          index={4}
        />
        <InputOTPSlot
          variant={variant}
          index={5}
        />
      </InputOTPGroup>
    </InputOTP>
    <Button
      variant="btn-outline"
      type="button"
      onClick={() => setShowNumPad((prev) => !prev)}
      className="ml-4 h-11 w-11 hover:bg-ciGrey/10"
    >
      <MdDialpad />
    </Button>
  </div>
);

export default OtpInput;
