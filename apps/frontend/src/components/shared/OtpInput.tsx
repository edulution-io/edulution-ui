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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/InputOtp';

type OtpInputProps = {
  totp: string;
  setTotp: (value: string) => void;
  onComplete?: () => void;
};

const OtpInput: React.FC<OtpInputProps> = ({ totp, setTotp, onComplete }) => (
  <div className="flex flex-col items-center space-y-4">
    <InputOTP
      maxLength={6}
      value={totp}
      onChange={(value) => setTotp(value)}
      onComplete={onComplete ? () => onComplete() : undefined}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  </div>
);

export default OtpInput;
