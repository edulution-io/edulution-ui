/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import cn from '@libs/common/utils/className';
import { CardContent as SHCardContent, CardSH as SHCard } from '@/components/ui/CardSH';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('border-solid shadow-xl', {
  variants: {
    variant: {
      collaboration: 'border-primary border-4',
      organisation: 'border-ciLightBlue border-4',
      infrastructure: 'border-ciLightGreen border-4',
      security: 'gradient-box',
      modal:
        'border-4 border-white fixed left-[50%] top-[40%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-[25px] text-foreground',
      text: 'border-accent border-3 bg-accent bg-opacity-20 inset-2 overflow-auto scrollbar-none hover:scrollbar-thin',
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
        className={cn('p-[20px]', className)}
        {...props}
      />
    );
  },
);

export { Card, CardContent };
