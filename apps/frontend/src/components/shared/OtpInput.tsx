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
