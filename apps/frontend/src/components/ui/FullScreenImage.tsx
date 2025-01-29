import React from 'react';
import { useTranslation } from 'react-i18next';

const FullScreenImage = ({ imageSrc }: { imageSrc: string }) => {
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full items-center justify-center bg-foreground">
      <img
        src={imageSrc}
        alt={t('preview.image')}
        className="max-h-screen max-w-full rounded-md"
      />
    </div>
  );
};

export default FullScreenImage;
