import React from 'react';
import { useTranslation } from 'react-i18next';
import { NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';

interface NativeAppHeaderProps {
  title: string;
  description: string | null;
  iconSrc: string;
}

const NativeAppHeader = ({ title, iconSrc, description }: NativeAppHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div
      className="mr-2 flex"
      id={NATIVE_APP_HEADER_ID}
    >
      <img
        src={iconSrc}
        alt={`${title} ${t('common.icon')}`}
        className="hidden h-20 w-20 object-contain md:block"
      />
      <div className="ml-4">
        <h2>{title}</h2>
        <div className="pt-5 sm:pt-0">{description && <p className="pb-4">{description}</p>}</div>
      </div>
    </div>
  );
};

export default NativeAppHeader;
