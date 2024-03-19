import React, { useState } from 'react';
import { Input as SHInput } from '@/components/ui/input';
import { cva, type VariantProps } from 'class-variance-authority';
import { EyeDarkIcon, EyeDarkSlashIcon } from '@/assets/icons';

import cn from '@/lib/utils';

const originInputVariants = cva(['rounded'], {
  variants: {
    variant: {
      default:
        'flex h-9 w-full border border-input bg-transparent px-3 py-1 text-p shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      login:
        'placeholder:color:ciLightGrey text-md block w-full border-2  border-gray-300 bg-white px-3 py-2 shadow-md placeholder:text-p focus:border-gray-600 focus:bg-white focus:placeholder-gray-500 focus:outline-none',
    },
  },
});

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & VariantProps<typeof originInputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, variant, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <SHInput
        type={showPassword ? 'text' : type}
        className={cn(originInputVariants({ variant, className }))}
        ref={ref}
        {...props}
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
  );
});
Input.displayName = 'Input';

export default Input;
