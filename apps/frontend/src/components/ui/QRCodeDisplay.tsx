import React, { FC } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  className?: string;
}
const QRCodeDisplay: FC<QRCodeDisplayProps> = ({ value, className }) => (
  <div className={className}>
    <QRCodeSVG
      value={value}
      size={256}
    />
  </div>
);

export default QRCodeDisplay;
