import React from 'react';
import { FileTypePreviewProps } from '@/datatypes/types';

interface OnlyOfficeProps extends FileTypePreviewProps {
  callbackUrl?: string;
}

const OnlyOffice: React.FC<OnlyOfficeProps> = ({ file, callbackUrl = '' }) => (
  <h1>
    OnlyOffice will be a feature which will be available soon: ${file.filename} ${callbackUrl}
  </h1>
);
OnlyOffice.defaultProps = {
  callbackUrl: 'http://192.168.0.1/file-sharing:5173',
};

export default OnlyOffice;
