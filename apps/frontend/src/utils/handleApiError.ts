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

/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';
import { toast } from 'sonner';
import i18n from '@/i18n';
import CustomAxiosError from '@libs/error/CustomAxiosError';
import { SHOW_TOASTER_DURATION } from '@libs/ui/constants/showToasterDuration';

/*
 * Use this function to handle errors in your store functions that do requests to the API.
 *
 * By default it will try to set the variable `error` in your store,
 * if it differs you have to pass the variable name as string.
 */
const displayedErrors = new Set<string>();

const handleApiError = (error: any, set: (params: any) => void, errorName = 'error') => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as CustomAxiosError;

    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return;
    }

    let errorMessage = i18n.t(axiosError.response?.data?.message) || axiosError.response?.statusText;

    if (error.response?.status === 413) {
      errorMessage = i18n.t('errors.requestTooLarge');
    }

    if (!displayedErrors.has(errorMessage)) {
      displayedErrors.add(errorMessage);
      toast.error(errorMessage || i18n.t('errors.unexpectedError'));

      setTimeout(() => {
        displayedErrors.delete(errorMessage);
      }, SHOW_TOASTER_DURATION);
    }

    set({ [errorName]: errorMessage });
  } else {
    console.error((error as Error).message);
    set({ [errorName]: i18n.t('errors.unexpectedError') });
  }
};

export default handleApiError;
