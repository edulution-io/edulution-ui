import React, { FC } from 'react';
import QRCode from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
}
const QRCodeDisplay: FC<QRCodeDisplayProps> = ({ value }) => (
  <div className="flex flex-col items-center justify-center">
    <QRCode
      value={value}
      size={256}
      bgColor="#ffffff"
      fgColor="#000000"
      level="L"
    />
  </div>
);

export default QRCodeDisplay;
