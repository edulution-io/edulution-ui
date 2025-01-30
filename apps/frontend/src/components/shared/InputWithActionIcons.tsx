import React from 'react';
import { IconType } from 'react-icons';
import { type VariantProps } from 'class-variance-authority';
import cn from '@libs/common/utils/className';
import Input, { originInputVariants } from '@/components/shared/Input';

type ActionIcon = { icon: IconType; onClick: () => void };

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof originInputVariants> & { actionIcons?: ActionIcon[] };

const InputWithActionIcons = React.forwardRef<HTMLInputElement, InputProps>(
  ({ actionIcons, className, variant, disabled, readOnly, ...props }, ref) => (
    <div className="relative">
      <Input
        {...props}
        className={cn(originInputVariants({ variant, className }))}
        ref={ref}
        readOnly={readOnly}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5 text-background">
        {actionIcons?.map(({ icon: ButtonIcon, onClick }, index) => (
          <button
            // eslint-disable-next-line react/no-array-index-key
            key={`input-buttons-${index}`}
            type="button"
            onClickCapture={onClick}
            disabled={disabled}
          >
            <ButtonIcon className={cn({ 'text-muted': disabled }, 'h-[24px] w-[24px]')} />
          </button>
        ))}
      </div>
    </div>
  ),
);
InputWithActionIcons.displayName = 'Input';

export default InputWithActionIcons;
