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

import React, { FC, useState, Dispatch, SetStateAction } from 'react';
import OtpInput from '@/components/shared/OtpInput';
import NumberPad from '@/components/ui/NumberPad';
import cn from '@libs/common/utils/className';

interface TotpInputProps {
  totp: string;
  title: string;
  maxLength?: number;
  type?: 'default' | 'pin';
  setTotp: Dispatch<SetStateAction<string>>;
  onComplete: () => void;
}

const TotpInput: FC<TotpInputProps> = ({ totp, title, maxLength, type, setTotp, onComplete }) => {
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
      {title && <div className="mt-3 text-center font-bold">{title}</div>}
      <OtpInput
        totp={totp}
        maxLength={maxLength}
        setTotp={setTotp}
        onComplete={onComplete}
        setShowNumPad={setShowNumPad}
        type={type}
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
        />
      </div>
    </>
  );
};

export default TotpInput;
