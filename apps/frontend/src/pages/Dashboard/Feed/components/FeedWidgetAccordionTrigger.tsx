import React from 'react';
import { useTranslation } from 'react-i18next';
import cn from '@/lib/utils';
import { AccordionTrigger } from '@/components/ui/AccordionSH';

interface FeedWidgetAccordionTriggerProps {
  src: string;
  alt: string;
  labelTranslationId: string;
  className?: string;
  width?: string;
}

const FeedWidgetAccordionTrigger = (props: FeedWidgetAccordionTriggerProps) => {
  const { src, alt, labelTranslationId, className, width = '40px' } = props;

  const { t } = useTranslation();

  return (
    <AccordionTrigger className="flex py-2 text-xl font-bold">
      {t(labelTranslationId)}
      <img
        src={src}
        alt={alt}
        className={cn('ml-4', className)}
        width={width}
      />
    </AccordionTrigger>
  );
};

export default FeedWidgetAccordionTrigger;
