import React from 'react';
import { IconType } from 'react-icons';
import { type VariantProps } from 'class-variance-authority';
import cn from '@/lib/utils';
import Input, { originInputVariants } from '@/components/shared/Input';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InputButton = { buttonIcon: IconType; buttonOnClick: () => void };

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof originInputVariants> & { inputButtons?: InputButton[] };

const InputWithChildButton = React.forwardRef<HTMLInputElement, InputProps>(
  ({ inputButtons, className, variant, ...props }, ref) => (
    <div className="relative">
      <Input
        className={cn(originInputVariants({ variant, className }))}
        ref={ref}
        variant="lightGray"
        {...props}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 text-background">
        {inputButtons?.map(({ buttonIcon: ButtonIcon, buttonOnClick }, index) => (
          <button
            // eslint-disable-next-line react/no-array-index-key
            key={`input-buttons-${index}`}
            type="button"
            onClickCapture={buttonOnClick}
          >
            <ButtonIcon className="h-[24px] w-[24px]" />
          </button>
        ))}
      </div>
    </div>
  ),
);
InputWithChildButton.displayName = 'Input';

export default InputWithChildButton;
