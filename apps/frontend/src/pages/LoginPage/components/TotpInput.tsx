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

import React, { FC, useState, Dispatch, SetStateAction } from 'react';
import OtpInput from '@/components/shared/OtpInput';
import NumberPad from '@/components/ui/NumberPad';
import cn from '@libs/common/utils/className';

interface TotpInputProps {
  totp: string;
  title: string;
  maxLength?: number;
  type?: 'default' | 'pin';
  variant?: 'default' | 'login';
  setTotp: Dispatch<SetStateAction<string>>;
  onComplete: () => void;
}

const TotpInput: FC<TotpInputProps> = ({ totp, title, maxLength, type, variant = 'default', setTotp, onComplete }) => {
  const [showNumPad, setShowNumPad] = useState(false);

  const handlePress = (digit: string) => {
    if (totp.length < 6) {
      setTotp(totp + digit);
    }
  };

  const handleClear = () => {
    setTotp(totp.slice(0, -1));
  };

  return (
    <>
      {title && (
        <div className={cn('mt-3 text-center font-bold', variant === 'login' && 'text-ciDarkGrey')}>{title}</div>
      )}
      <OtpInput
        totp={totp}
        maxLength={maxLength}
        setTotp={setTotp}
        onComplete={onComplete}
        setShowNumPad={setShowNumPad}
        type={type}
        variant={variant}
      />
      <div
        className={cn(
          'flex justify-center overflow-hidden transition-[max-height] duration-300 ease-in-out',
          showNumPad ? 'max-h-80' : 'max-h-0',
        )}
      >
        <NumberPad
          onPress={handlePress}
          onClear={handleClear}
          variant={variant}
        />
      </div>
    </>
  );
};

export default TotpInput;
