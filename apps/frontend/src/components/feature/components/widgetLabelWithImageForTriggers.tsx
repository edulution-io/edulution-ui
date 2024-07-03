import React from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@/lib/utils';

interface WidgetLabelWithImageForTriggersProps {
  src: string;
  alt: string;
  translationIdLabel: string;
  className?: string;
  width?: string;
}

const WidgetLabelWithImageForTriggers = (props: WidgetLabelWithImageForTriggersProps) => {
  const { src, alt, translationIdLabel, className, width = '40px' } = props;

  const { t } = useTranslation();

  return (
    <>
      {t(translationIdLabel)}
      <img
        src={src}
        alt={alt}
        className={cn('ml-4', className)}
        width={width}
      />
    </>
  );
};

export default WidgetLabelWithImageForTriggers;
