'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      closeButton
      offset={60}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: 'group toast group-[.toaster]:bg-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          content: 'group-[.toaster]:text-background',
        },
      }}
      richColors
      {...props}
    />
  );
};

export default Toaster;
