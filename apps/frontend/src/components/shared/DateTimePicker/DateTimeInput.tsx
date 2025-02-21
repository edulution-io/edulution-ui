import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from '@libs/common/utils/className';

export const originInputVariants = cva(['rounded'], {
  variants: {
    variant: {
      login:
        'block w-full border-2 border-gray-300 bg-background px-3 py-2 shadow-md placeholder:text-p focus:border-gray-600 focus:bg-background focus:placeholder-muted focus:outline-none text-foreground',
      lightGrayDisabled: 'bg-ciDarkGreyDisabled text-secondary placeholder:text-p focus:outline-none',
      default: 'bg-accent text-secondary placeholder:text-p focus:outline-none',
      dialog: 'bg-muted text-foreground placeholder:text-p focus:outline-none text-background',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type DateTimeInputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof originInputVariants> & {
    popupColorScheme?: string;
  };

const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ className, variant, popupColorScheme = 'dark', ...props }, ref) => {
    const date = new Date();
    const month = date.getMonth() + 1;
    const minimumDateString = `${date.getFullYear()}-${month < 10 ? `0${month}` : month}-${date.getDate()}T00:00`;
    return (
      <div className="relative">
        <input
          aria-label="Date and time"
          type="datetime-local"
          style={{
            colorScheme: popupColorScheme,
          }}
          className={cn(
            originInputVariants({ variant }),
            // After merging changes from main branch, Add the className prop to the default input component
            className,
          )}
          min={minimumDateString}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
DateTimeInput.displayName = 'DateTimeInput';

export { DateTimeInput };
