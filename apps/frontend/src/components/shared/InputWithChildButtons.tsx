import React from 'react';
import { IconType } from 'react-icons';
import { type VariantProps } from 'class-variance-authority';
import cn from '@/lib/utils';
import Input, { originInputVariants } from '@/components/shared/Input';

type InputButton = { Icon: IconType; onClick: () => void };

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof originInputVariants> & { inputButtons?: InputButton[] };

const InputWithChildButton = React.forwardRef<HTMLInputElement, InputProps>(
  ({ inputButtons, className, variant, disabled, readOnly, ...props }, ref) => (
    <div className="relative">
      <Input
        {...props}
        className={cn(originInputVariants({ variant, className }))}
        ref={ref}
        variant="lightGray"
        readOnly={readOnly}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 text-background">
        {inputButtons?.map(({ Icon: ButtonIcon, onClick }, index) => (
          <button
            // eslint-disable-next-line react/no-array-index-key
            key={`input-buttons-${index}`}
            type="button"
            onClickCapture={onClick}
            disabled={disabled}
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
