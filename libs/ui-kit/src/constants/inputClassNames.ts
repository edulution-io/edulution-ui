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

export const INPUT_BASE_CLASSES =
  'h-10 w-full rounded-lg px-3 text-p transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

export const VARIANT_COLORS = {
  default: 'dark:bg-accent border border-accent-light bg-white text-foreground',
  dialog: 'dark:bg-accent border border-accent-light bg-white text-foreground',
  login: 'border-[1px] border-gray-300 bg-white text-black shadow-md',
  lightGrayDisabled: 'bg-ciDarkGreyDisabled text-secondary',
} as const;
