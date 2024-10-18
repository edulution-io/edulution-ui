import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Input as SHInput } from '@/components/ui/Input';
import { EyeDarkIcon, EyeDarkSlashIcon } from '@/assets/icons';

import cn from '@/lib/utils';

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

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & VariantProps<typeof originInputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, variant, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="relative">
        <SHInput
          {...props}
          type={showPassword ? 'text' : type}
          className={cn(originInputVariants({ variant, className }))}
          ref={ref}
        />
        {type === 'password' ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm leading-5">
            {showPassword ? (
              <button
                type="button"
                onClickCapture={() => setShowPassword((prevValue) => !prevValue)}
              >
                <img
                  src={EyeDarkIcon}
                  alt="eye"
                  width="25px"
                />
              </button>
            ) : (
              <button
                type="button"
                onClickCapture={() => setShowPassword((prevValue) => !prevValue)}
              >
                <img
                  src={EyeDarkSlashIcon}
                  alt="eye"
                  width="25px"
                />
              </button>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
});

Input.displayName = 'Input';

export default Input;
