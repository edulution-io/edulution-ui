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

import React, { FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sizes } from '@libs/ui/types/sizes';

interface QRCodeDisplayProps {
  value: string;
  size?: Sizes;
}
const QRCodeDisplay: FC<QRCodeDisplayProps> = ({ value, size }) => {
  const getPixelSize = () => {
    switch (size) {
      case 'sm':
        return 64;
      case 'md':
        return 128;
      case 'lg':
        return 200;
      default:
        return 256;
    }
  };

  return (
    <div className="m-14 flex flex-col items-center justify-center rounded-xl bg-transparent p-2">
      <QRCodeSVG
        value={value}
        size={getPixelSize()}
      />
    </div>
  );
};

export default QRCodeDisplay;
