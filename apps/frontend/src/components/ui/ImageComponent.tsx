import React, { useState } from 'react';

interface ImageComponentProps {
  downloadLink: string;
  altText: string;
  placeholder?: string;
}

const ImageComponent: React.FC<ImageComponentProps> = ({ downloadLink, altText, placeholder }) => {
  const [src, setSrc] = useState(downloadLink);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (placeholder) {
      setSrc(placeholder);
    }
    setError(true);
  };

  return (
    <div className="relative w-full ">
      <img
        src={src}
        alt={altText}
        onError={handleError}
        className={`h-auto w-full ${error ? 'border border-red-500' : 'border'}`}
      />
      {error && <p className="text-red-500">Failed to load image</p>}
    </div>
  );
};

export default ImageComponent;
