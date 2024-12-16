import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from '@libs/common/utils/className';
import { Input as SHInput } from '@/components/ui/Input';
import { EyeDarkIcon, EyeDarkSlashIcon, EyeLightIcon, EyeLightSlashIcon } from '@/assets/icons';

export const originInputVariants = cva(['rounded'], {
  variants: {
    variant: {
      light:
        'placeholder:color:ciLightGrey border border-input placeholder:text-p placeholder:text-p focus:border-gray-600 focus:bg-white focus:placeholder-ciGrey focus:outline-none',
      default:
        'placeholder:color:ciLightGrey placeholder:text-p border border-input placeholder:text-p focus:border-gray-600 focus:bg-white focus:placeholder-ciGrey focus:outline-none',
      login:
        'block w-full border-2 border-gray-300 bg-white px-3 py-2 shadow-md placeholder:text-p focus:border-gray-600 focus:bg-white focus:placeholder-ciGrey focus:outline-none',
      lightGray: 'bg-ciDarkGrey text-ciLightGrey placeholder:text-p focus:outline-none',
      lightGrayDisabled: 'bg-ciDarkGreyDisabled text-ciLGrey placeholder:text-p focus:outline-none',
    },
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

    const isVariantSchemeDark = variant ? ['lightGray', 'lightGrayDisabled'].includes(variant) : false;
    const closedIcon = isVariantSchemeDark ? EyeLightIcon : EyeDarkIcon;
    const openedIcon = isVariantSchemeDark ? EyeLightSlashIcon : EyeDarkSlashIcon;
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
