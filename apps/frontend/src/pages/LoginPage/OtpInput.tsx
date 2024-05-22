import Input from '@/components/shared/Input';
import React, { useRef, useState } from 'react';

type OtpInputProps = {
  length: number;
  onComplete: (pin: string) => void;
};
const OtpInput = ({ length = 4, onComplete }: OtpInputProps) => {
  const inputRef = useRef<HTMLInputElement[]>([]);
  const [OTP, setOTP] = useState<string[]>(Array(length).fill(''));

  const handleTextChange = (input: string, index: number) => {
    const newPin = [...OTP];
    newPin[index] = input;
    setOTP(newPin);

    if (input.length === 1 && index < length - 1) {
      inputRef.current[index + 1]?.focus();
    }

    if (input.length === 0 && index > 0) {
      inputRef.current[index - 1]?.focus();
    }

    if (newPin.every((digit) => digit !== '')) {
      onComplete(newPin.join(''));
    }
  };

  return (
    <div className="grid grid-cols-6 gap-5">
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          type="text"
          variant="login"
          maxLength={1}
          value={OTP[index]}
          onChange={(e) => handleTextChange(e.target.value, index)}
          ref={(ref) => {
            inputRef.current[index] = ref as HTMLInputElement;
          }}
        />
      ))}
    </div>
  );
};

export default OtpInput;
