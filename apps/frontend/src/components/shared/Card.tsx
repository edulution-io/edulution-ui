import React from 'react';
import cn from '@/lib/utils';
import { Card as SHCard, CardContent as SHCardContent } from '@/components/ui/card';
import { cva, type VariantProps } from 'class-variance-authority';

import styles from './card.module.scss';

const cardVariants = cva('border-4 border-solid', {
  variants: {
    variant: {
      collaboration: 'border-ciDarkBlue',
      organisation: 'border-ciLightBlue',
      infrastructure: 'border-ciLightGreen',
      security: styles['gradient-box'],
      modal:
        'border-white fixed left-[50%] top-[40%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-[25px] text-black',
    },
  },
  defaultVariants: {
    variant: 'collaboration',
  },
});

type CardProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, ...props }, ref) => {
  Card.displayName = 'Card';

  return (
    <SHCard
      ref={ref}
      className={cn(cardVariants({ variant }), 'border-4 border-solid', className)}
      {...props}
    />
  );
});

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref): JSX.Element => {
    CardContent.displayName = 'CardContent';
    return (
      <SHCardContent
        ref={ref}
        className={cn('p-[20px]', className)}
        {...props}
      />
    );
  },
);

export { Card, CardContent };
