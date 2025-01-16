import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from '@libs/common/utils/className';
import { Input as SHInput } from '@/components/ui/Input';
import { EyeLightIcon, EyeLightSlashIcon } from '@/assets/icons';

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

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof originInputVariants> & {
    shouldTrim?: boolean;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, shouldTrim = false, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      const newValue = shouldTrim ? value.trim() : value;

      if (onChange) {
        onChange({
          ...event,
          target: {
            ...event.target,
            value: newValue,
          },
        });
      }
    };

    const closedIcon = EyeLightIcon;
    const openedIcon = EyeLightSlashIcon;
    return (
      <div className="relative">
        <SHInput
          type={showPassword ? 'text' : type}
          className={cn(originInputVariants({ variant, className }))}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {type === 'password' ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5">
            <button
              type="button"
              onClickCapture={() => setShowPassword((prevValue) => !prevValue)}
            >
              <img
                src={showPassword ? closedIcon : openedIcon}
                alt="eye"
                width="25px"
              />
            </button>
          </div>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
