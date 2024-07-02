import React, { FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
}
const QRCodeDisplay: FC<QRCodeDisplayProps> = ({ value }) => (
  <div className="flex flex-col items-center justify-center">
    <QRCodeSVG
      value={value}
      size={256}
    />
  </div>
);

export default QRCodeDisplay;
