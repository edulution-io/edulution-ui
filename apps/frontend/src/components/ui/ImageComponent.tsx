import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageComponentProps {
  downloadLink: string;
  altText: string;
  placeholder?: string;
}

const ImageComponent: React.FC<ImageComponentProps> = ({ downloadLink, altText, placeholder }) => {
  const [src, setSrc] = useState(downloadLink);
  const [error, setError] = useState(false);
  const { t } = useTranslation();
  const handleError = () => {
    if (placeholder) {
      setSrc(placeholder);
    }
    setError(true);
  };

  return (
    <div className="relative w-full">
      <img
        src={src}
        alt={altText}
        onError={handleError}
        className={`h-auto w-full ${error ? 'border-text-ciRed border' : 'border'}`}
      />
      {error && <p className="text-text-ciRed">{t('preview.failedToLoadImage')}</p>}
    </div>
  );
};

export default ImageComponent;
