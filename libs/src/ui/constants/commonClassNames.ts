/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { cva } from 'class-variance-authority';

export const INPUT_BASE_CLASSES =
  'h-10 w-full rounded-lg px-3 text-p transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

export const VARIANT_COLORS = {
  default: 'bg-white text-black border-[1px] border-gray-300 dark:bg-accent dark:text-secondary dark:border-none',
  dialog: 'dark:bg-muted border-[1px] dark:border-none border-gray-300 bg-white text-background',
  login: 'border-[1px] border-gray-300 bg-white text-black shadow-md',
  lightGrayDisabled: 'bg-ciDarkGreyDisabled text-secondary',
} as const;

const VARIANT_CARET = {
  default: 'bg-secondary',
  dialog: 'bg-background',
  login: 'bg-black',
} as const;

export const inputVariants = cva(INPUT_BASE_CLASSES, {
  variants: {
    variant: {
      default: `${VARIANT_COLORS.default} placeholder:text-p`,
      dialog: `${VARIANT_COLORS.dialog} placeholder:text-p`,
      login: `${VARIANT_COLORS.login} placeholder:text-p focus:border-gray-600 focus:bg-white focus:placeholder-muted`,
      lightGrayDisabled: `${VARIANT_COLORS.lightGrayDisabled} placeholder:text-p`,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const inputOTPSlotVariants = cva(
  'relative mx-1 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm transition-all first:ml-0',
  {
    variants: {
      variant: {
        default: VARIANT_COLORS.default,
        dialog: VARIANT_COLORS.dialog,
        login: VARIANT_COLORS.login,
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const inputOTPCaretVariants = cva('h-4 w-px animate-caret-blink duration-1000', {
  variants: {
    variant: {
      default: VARIANT_CARET.default,
      dialog: VARIANT_CARET.dialog,
      login: VARIANT_CARET.login,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
