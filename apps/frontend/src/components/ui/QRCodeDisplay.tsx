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
    <div className="m-14 flex flex-col items-center justify-center rounded-xl bg-background p-2">
      <QRCodeSVG
        value={value}
        size={getPixelSize()}
      />
    </div>
  );
};

export default QRCodeDisplay;
