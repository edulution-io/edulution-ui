/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import cn from '@libs/common/utils/className';
import { CardContent as SHCardContent, CardSH as SHCard } from '@/components/ui/CardSH';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('border-solid', {
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
