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
import { useTranslation } from 'react-i18next';
import OtpInput from '@/components/shared/OtpInput';

interface TotpInputProps {
  totp: string;
  setTotp: (value: string) => void;
  onComplete: () => void;
}

const TotpInput: React.FC<TotpInputProps> = ({ totp, setTotp, onComplete }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mt-3 text-center font-bold">{t('login.enterMultiFactorCode')}</div>
      <OtpInput
        totp={totp}
        setTotp={setTotp}
        onComplete={onComplete}
      />
    </>
  );
};

export default TotpInput;
