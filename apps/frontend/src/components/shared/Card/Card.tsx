import React from 'react';
import cn from '@libs/common/utils/className';
import { CardContent as SHCardContent, CardSH as SHCard } from '@/components/ui/CardSH';
import { cva, type VariantProps } from 'class-variance-authority';

import styles from './card.module.scss';

const cardVariants = cva('border-solid', {
  variants: {
    variant: {
      collaboration: 'border-ciDarkBlue border-4',
      organisation: 'border-ciLightBlue border-4',
      infrastructure: 'border-ciLightGreen border-4',
      security: styles['gradient-box'],
      modal:
        'border-4 border-white fixed left-[50%] top-[40%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-[25px] text-foreground',
      text: 'border-ciGrey border-3 bg-ciGrey bg-opacity-20 inset-2 overflow-auto scrollbar-none hover:scrollbar-thin',
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
      className={cn(cardVariants({ variant }), 'border-solid', className)}
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
        className={cn('h-full w-full p-[20px]', className)}
        {...props}
      />
    );
  },
);

export { Card, CardContent };
